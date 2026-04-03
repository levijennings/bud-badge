import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSuccessResponse,
  createErrorResponse,
  requireOrgRole,
  HTTP_STATUS,
} from '@/lib/api-helpers'
import { memberUpdateSchema } from '@/lib/validations'

// PATCH /api/organizations/[orgId]/members/[memberId] - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; memberId: string }> }
) {
  try {
    const { orgId, memberId } = await params
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
    const validation = memberUpdateSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST,
        validation.error.flatten()
      )
    }

    const supabase = await createClient()

    // Verify member exists in organization
    const { data: member, error: fetchError } = await supabase
      .from('org_members')
      .select('*')
      .eq('id', memberId)
      .eq('org_id', orgId)
      .single()

    if (fetchError || !member) {
      return createErrorResponse(
        'Member not found',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    // Prevent removing all owners
    if (member.role === 'owner' && validation.data.role !== 'owner') {
      const { count: ownerCount } = await supabase
        .from('org_members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('role', 'owner')

      if (ownerCount === 1) {
        return createErrorResponse(
          'Cannot remove the last owner of an organization',
          'INVALID_ACTION',
          HTTP_STATUS.CONFLICT
        )
      }
    }

    // Update member role
    const { data: updatedMember, error: updateError } = await supabase
      .from('org_members')
      .update({ role: validation.data.role })
      .eq('id', memberId)
      .select()
      .single()

    if (updateError || !updatedMember) {
      console.error('Failed to update member:', updateError)
      return createErrorResponse(
        'Failed to update member',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    return createSuccessResponse(updatedMember, 'Member role updated successfully')
  } catch (error) {
    console.error('PATCH /api/organizations/[orgId]/members/[memberId] error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

// DELETE /api/organizations/[orgId]/members/[memberId] - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; memberId: string }> }
) {
  try {
    const { orgId, memberId } = await params
    const { authorized, response: authResponse } = await requireOrgRole(
      request,
      orgId,
      ['owner', 'manager']
    )

    if (!authorized) {
      return authResponse
    }

    const supabase = await createClient()

    // Verify member exists in organization
    const { data: member, error: fetchError } = await supabase
      .from('org_members')
      .select('*')
      .eq('id', memberId)
      .eq('org_id', orgId)
      .single()

    if (fetchError || !member) {
      return createErrorResponse(
        'Member not found',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    // Prevent removing the last owner
    if (member.role === 'owner') {
      const { count: ownerCount } = await supabase
        .from('org_members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('role', 'owner')

      if (ownerCount === 1) {
        return createErrorResponse(
          'Cannot remove the last owner of an organization',
          'INVALID_ACTION',
          HTTP_STATUS.CONFLICT
        )
      }
    }

    // Delete member
    const { error: deleteError } = await supabase
      .from('org_members')
      .delete()
      .eq('id', memberId)

    if (deleteError) {
      console.error('Failed to remove member:', deleteError)
      return createErrorResponse(
        'Failed to remove member',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    // Decrement employee count
    const { data: org } = await supabase
      .from('organizations')
      .select('employee_count')
      .eq('id', orgId)
      .single()

    if (org && org.employee_count > 0) {
      await supabase
        .from('organizations')
        .update({ employee_count: org.employee_count - 1 })
        .eq('id', orgId)
    }

    return createSuccessResponse(null, 'Member removed successfully')
  } catch (error) {
    console.error('DELETE /api/organizations/[orgId]/members/[memberId] error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
