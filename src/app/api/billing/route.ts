import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSuccessResponse,
  createErrorResponse,
  requireAuth,
  HTTP_STATUS,
} from '@/lib/api-helpers'
import { billingCheckoutSchema } from '@/lib/validations'
import { stripe, PLANS } from '@/lib/stripe'

// GET /api/billing - Get current subscription
export async function GET(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request)
    if (!user) {
      return authResponse
    }

    const supabase = await createClient()

    // Get user's organization
    const { data: memberData } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    if (!memberData) {
      return createErrorResponse(
        'User not part of any organization',
        'UNAUTHORIZED',
        HTTP_STATUS.UNAUTHORIZED
      )
    }

    // Get organization
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', memberData.org_id)
      .single()

    if (!org) {
      return createErrorResponse(
        'Organization not found',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    let subscription = null

    // If organization has stripe customer, get subscription details
    if (org.stripe_customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: org.stripe_customer_id,
          limit: 1,
        })

        if (subscriptions.data.length > 0) {
          const sub = subscriptions.data[0]
          subscription = {
            id: sub.id,
            status: sub.status,
            plan: org.plan,
            current_period_start: new Date(sub.current_period_start * 1000),
            current_period_end: new Date(sub.current_period_end * 1000),
            cancel_at_period_end: sub.cancel_at_period_end,
          }
        }
      } catch (stripeError) {
        console.error('Failed to fetch Stripe subscription:', stripeError)
      }
    }

    return createSuccessResponse({
      plan: org.plan,
      stripe_customer_id: org.stripe_customer_id || null,
      subscription,
      plan_details: PLANS[org.plan as keyof typeof PLANS],
      limits: {
        max_employees: org.max_employees,
        current_employees: org.employee_count,
      },
    })
  } catch (error) {
    console.error('GET /api/billing error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

// POST /api/billing - Create checkout session
export async function POST(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request)
    if (!user) {
      return authResponse
    }

    const body = await request.json()

    // Validate input
    const validation = billingCheckoutSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST,
        validation.error.flatten()
      )
    }

    if (validation.data.plan === 'enterprise') {
      return createErrorResponse(
        'Please contact sales for enterprise plan',
        'INVALID_PLAN',
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const supabase = await createClient()

    // Get user's organization
    const { data: memberData } = await supabase
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .single()

    if (!memberData) {
      return createErrorResponse(
        'User not part of any organization',
        'UNAUTHORIZED',
        HTTP_STATUS.UNAUTHORIZED
      )
    }

    // Only owners can change plans
    if (memberData.role !== 'owner') {
      return createErrorResponse(
        'Only organization owners can manage billing',
        'FORBIDDEN',
        HTTP_STATUS.FORBIDDEN
      )
    }

    // Get organization
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', memberData.org_id)
      .single()

    if (!org) {
      return createErrorResponse(
        'Organization not found',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    let customerId = org.stripe_customer_id

    // Create customer if doesn't exist
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            org_id: memberData.org_id,
            org_name: org.name,
          },
        })
        customerId = customer.id

        // Update organization with stripe customer ID
        await supabase
          .from('organizations')
          .update({ stripe_customer_id: customerId })
          .eq('id', memberData.org_id)
      } catch (stripeError) {
        console.error('Failed to create Stripe customer:', stripeError)
        return createErrorResponse(
          'Failed to create billing customer',
          'STRIPE_ERROR',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      }
    }

    // Get or create price for plan
    let priceId: string | null = null

    const planDetails = PLANS[validation.data.plan as keyof typeof PLANS]
    if (planDetails.price !== null) {
      // In production, you would need to set up price IDs in Stripe
      // For now, we'll use a placeholder that should be configured
      priceId = process.env[`STRIPE_PRICE_ID_${validation.data.plan.toUpperCase()}`] || null

      if (!priceId) {
        return createErrorResponse(
          'Price not configured for this plan',
          'CONFIG_ERROR',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      }
    }

    // Create checkout session
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId!,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
        metadata: {
          org_id: memberData.org_id,
          plan: validation.data.plan,
        },
      })

      return createSuccessResponse({
        session_id: session.id,
        session_url: session.url,
      })
    } catch (stripeError) {
      console.error('Failed to create checkout session:', stripeError)
      return createErrorResponse(
        'Failed to create checkout session',
        'STRIPE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }
  } catch (error) {
    console.error('POST /api/billing error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
