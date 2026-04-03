import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSuccessResponse,
  createErrorResponse,
  requireAuth,
  parsePagination,
  HTTP_STATUS,
} from '@/lib/api-helpers'

// GET /api/certifications - Get user's or organization's certifications
export async function GET(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request)
    if (!user) {
      return authResponse
    }

    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'user' // 'user' or 'organization'
    const { page, limit, offset, error: paginationError } = parsePagination(
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

    let query

    if (scope === 'organization') {
      // Check if user is manager or owner to view org certifications
      if (!['owner', 'manager'].includes(memberData.role)) {
        return createErrorResponse(
          'Insufficient permissions to view organization certifications',
          'FORBIDDEN',
          HTTP_STATUS.FORBIDDEN
        )
      }

      // Get all certifications in organization
      query = supabase
        .from('certifications')
        .select(
          '*, profiles:user_id(display_name, email), training_modules(title, category)',
          { count: 'exact' }
        )
        .eq('org_id', memberData.org_id)
    } else {
      // Get user's certifications
      query = supabase
        .from('certifications')
        .select('*, training_modules(title, category)', { count: 'exact' })
        .eq('user_id', user.id)
    }

    const { data: certifications, count, error } = await query
      .range(offset, offset + limit - 1)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch certifications:', error)
      return createErrorResponse(
        'Failed to fetch certifications',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    // Check expiration status
    const certificationsWithStatus = (certifications || []).map((cert: any) => ({
      ...cert,
      is_expired: cert.expires_at ? new Date(cert.expires_at) < new Date() : false,
    }))

    return createSuccessResponse({
      certifications: certificationsWithStatus,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/certifications error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
