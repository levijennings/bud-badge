import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSuccessResponse,
  createErrorResponse,
  requireAuth,
  HTTP_STATUS,
} from '@/lib/api-helpers'
import { orgCreateSchema } from '@/lib/validations'

// GET /api/organizations - Get user's organization
export async function GET(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request)
    if (!user) {
      return authResponse
    }

    const supabase = await createClient()

    // Get user's organization through org_members
    const { data: memberData, error: memberError } = await supabase
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .single()

    if (memberError || !memberData) {
      return createErrorResponse(
        'User is not part of any organization',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    // Get organization with member count
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', memberData.org_id)
      .single()

    if (orgError || !orgData) {
      return createErrorResponse(
        'Organization not found',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from('org_members')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', memberData.org_id)

    return createSuccessResponse({
      ...orgData,
      current_member_count: memberCount || 0,
      user_role: memberData.role,
    })
  } catch (error) {
    console.error('GET /api/organizations error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

// POST /api/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request)
    if (!user) {
      return authResponse
    }

    const body = await request.json()

    // Validate input
    const validation = orgCreateSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST,
        validation.error.flatten()
      )
    }

    const supabase = await createClient()

    // Check if slug already exists
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', validation.data.slug)
      .single()

    if (existingOrg) {
      return createErrorResponse(
        'Organization slug already exists',
        'CONFLICT',
        HTTP_STATUS.CONFLICT
      )
    }

    // Determine max employees based on plan
    const maxEmployees = {
      starter: 10,
      professional: 50,
      enterprise: 999999,
    }[validation.data.plan]

    // Create organization
    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert({
        name: validation.data.name,
        slug: validation.data.slug,
        license_number: validation.data.license_number || null,
        state: validation.data.state,
        city: validation.data.city,
        plan: validation.data.plan,
        employee_count: 1,
        max_employees: maxEmployees,
      })
      .select()
      .single()

    if (createError || !newOrg) {
      console.error('Failed to create organization:', createError)
      return createErrorResponse(
        'Failed to create organization',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    // Add user as owner
    const { error: memberError } = await supabase.from('org_members').insert({
      org_id: newOrg.id,
      user_id: user.id,
      role: 'owner',
    })

    if (memberError) {
      console.error('Failed to add owner to organization:', memberError)
      // Clean up organization
      await supabase.from('organizations').delete().eq('id', newOrg.id)
      return createErrorResponse(
        'Failed to add owner to organization',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    return createSuccessResponse(newOrg, 'Organization created successfully', HTTP_STATUS.CREATED)
  } catch (error) {
    console.error('POST /api/organizations error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
