import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSuccessResponse,
  createErrorResponse,
  requireOrgRole,
  parsePagination,
  HTTP_STATUS,
} from '@/lib/api-helpers'
import { memberInviteSchema } from '@/lib/validations'

// GET /api/organizations/[orgId]/members - List organization members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params
    const { authorized, response: authResponse } = await requireOrgRole(
      request,
      orgId,
      ['owner', 'manager', 'budtender']
    )

    if (!authorized) {
      return authResponse
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, offset, search, error: paginationError } = parsePagination(
      Object.fromEntries(searchParams)
    )

    if (paginationError) {
      return createErrorResponse(
        'Invalid pagination parameters',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('org_members')
      .select('*, profiles:user_id(display_name, email)', { count: 'exact' })
      .eq('org_id', orgId)

    if (search) {
      // Note: This is a simple filter - in production, consider full-text search
      query = query.or(`profiles.email.ilike.%${search}%,profiles.display_name.ilike.%${search}%`)
    }

    const { data: members, count, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch members:', error)
      return createErrorResponse(
        'Failed to fetch members',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    return createSuccessResponse({
      members: members || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/organizations/[orgId]/members error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

// POST /api/organizations/[orgId]/members - Invite member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params
    const { authorized, response: authResponse } = await requireOrgRole(
      request,
      orgId,
      ['owner', 'manager']
    )

    if (!authorized) {
      return authResponse
    }

    const body = await request.json()

    // Validate input
    const validation = memberInviteSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST,
        validation.error.flatten()
      )
    }

    const supabase = await createClient()

    // Check if organization exists
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('employee_count, max_employees')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return createErrorResponse(
        'Organization not found',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    // Check capacity
    if (org.employee_count >= org.max_employees) {
      return createErrorResponse(
        'Organization has reached maximum employee limit',
        'CAPACITY_EXCEEDED',
        HTTP_STATUS.CONFLICT
      )
    }

    // Check if user with email exists
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const userWithEmail = existingUser?.users?.find(u => u.email === validation.data.email)

    if (!userWithEmail) {
      return createErrorResponse(
        'User with this email does not exist',
        'USER_NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('org_members')
      .select('id')
      .eq('org_id', orgId)
      .eq('user_id', userWithEmail.id)
      .single()

    if (existingMember) {
      return createErrorResponse(
        'User is already a member of this organization',
        'ALREADY_MEMBER',
        HTTP_STATUS.CONFLICT
      )
    }

    // Add member
    const { data: newMember, error: memberError } = await supabase
      .from('org_members')
      .insert({
        org_id: orgId,
        user_id: userWithEmail.id,
        role: validation.data.role,
      })
      .select()
      .single()

    if (memberError || !newMember) {
      console.error('Failed to add member:', memberError)
      return createErrorResponse(
        'Failed to add member',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    // Increment employee count
    await supabase
      .from('organizations')
      .update({ employee_count: org.employee_count + 1 })
      .eq('id', orgId)

    return createSuccessResponse(
      newMember,
      'Member invited successfully',
      HTTP_STATUS.CREATED
    )
  } catch (error) {
    console.error('POST /api/organizations/[orgId]/members error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
