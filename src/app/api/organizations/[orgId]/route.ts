import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSuccessResponse,
  createErrorResponse,
  requireOrgRole,
  HTTP_STATUS,
} from '@/lib/api-helpers'
import { orgUpdateSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params
    const { authorized, member, response: authResponse } = await requireOrgRole(
      request,
      orgId,
      ['owner', 'manager', 'budtender']
    )

    if (!authorized) {
      return authResponse
    }

    const supabase = await createClient()

    // Get organization details
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
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
      .eq('org_id', orgId)

    // Get completion stats
    const { data: completionStats } = await supabase
      .from('training_progress')
      .select('user_id, progress_pct, status')
      .eq('org_id', orgId)

    let avgCompletion = 0
    if (completionStats && completionStats.length > 0) {
      const totalProgress = completionStats.reduce((sum, stat) => sum + stat.progress_pct, 0)
      avgCompletion = Math.round(totalProgress / completionStats.length)
    }

    return createSuccessResponse({
      ...org,
      member_count: memberCount || 0,
      avg_completion: avgCompletion,
    })
  } catch (error) {
    console.error('GET /api/organizations/[orgId] error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params
    const { authorized, response: authResponse } = await requireOrgRole(
      request,
      orgId,
      ['owner']
    )

    if (!authorized) {
      return authResponse
    }

    const body = await request.json()

    // Validate input
    const validation = orgUpdateSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST,
        validation.error.flatten()
      )
    }

    const supabase = await createClient()

    // If updating slug, check for duplicates
    if (validation.data.name) {
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', orgId)
        .single()

      if (!existingOrg) {
        return createErrorResponse(
          'Organization not found',
          'NOT_FOUND',
          HTTP_STATUS.NOT_FOUND
        )
      }
    }

    // Update organization
    const { data: updatedOrg, error: updateError } = await supabase
      .from('organizations')
      .update({
        ...(validation.data.name && { name: validation.data.name }),
        ...(validation.data.license_number && {
          license_number: validation.data.license_number,
        }),
        ...(validation.data.state && { state: validation.data.state }),
        ...(validation.data.city && { city: validation.data.city }),
      })
      .eq('id', orgId)
      .select()
      .single()

    if (updateError || !updatedOrg) {
      console.error('Failed to update organization:', updateError)
      return createErrorResponse(
        'Failed to update organization',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    return createSuccessResponse(updatedOrg, 'Organization updated successfully')
  } catch (error) {
    console.error('PATCH /api/organizations/[orgId] error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
