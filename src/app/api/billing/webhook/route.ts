import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { createErrorResponse, HTTP_STATUS } from '@/lib/api-helpers'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// POST /api/billing/webhook - Stripe webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')

    if (!sig || !webhookSecret) {
      return createErrorResponse(
        'Missing webhook signature or secret',
        'INVALID_REQUEST',
        HTTP_STATUS.BAD_REQUEST
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return createErrorResponse(
        'Invalid webhook signature',
        'INVALID_SIGNATURE',
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const supabase = await createClient()

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get organization by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          // Update subscription status
          const status = subscription.status === 'active' ? 'active' : 'inactive'

          const planId = subscription.items.data[0]?.plan.id || null
          await supabase
            .from('organizations')
            .update({
              stripe_subscription_id: subscription.id,
            })
            .eq('id', org.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get organization by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id, plan')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          // Downgrade to starter plan
          await supabase
            .from('organizations')
            .update({
              plan: 'starter',
              stripe_subscription_id: null,
              max_employees: 10,
            })
            .eq('id', org.id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Get organization by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          // Log payment received (could also update payment history table)
          console.log(`Payment received for organization ${org.id}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Get organization by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          // Log payment failure (could also trigger notification)
          console.error(`Payment failed for organization ${org.id}`)
        }
        break
      }

      case 'customer.deleted': {
        const customer = event.data.object as Stripe.Customer
        const customerId = customer.id

        // Get organization by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          // Clear Stripe customer ID
          await supabase
            .from('organizations')
            .update({ stripe_customer_id: null })
            .eq('id', org.id)
        }
        break
      }

      default:
        // Unhandled event type - log for monitoring
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return createErrorResponse(
      'Webhook processing failed',
      'WEBHOOK_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
