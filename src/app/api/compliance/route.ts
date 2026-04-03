import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSuccessResponse,
  createErrorResponse,
  requireOrgRole,
  HTTP_STATUS,
} from '@/lib/api-helpers'
import { complianceRecordSchema } from '@/lib/validations'

// GET /api/compliance - Get organization compliance status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId?: string }> } = { params: Promise.resolve({}) }
) {
  try {
    const searchParams = new URL(request.url).searchParams
    const orgId = searchParams.get('org_id')

    if (!orgId) {
      return createErrorResponse(
        'Organization ID is required',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const { authorized, response: authResponse } = await requireOrgRole(
      request,
      orgId,
      ['owner', 'manager', 'budtender']
    )

    if (!authorized) {
      return authResponse
    }

    const supabase = await createClient()

    // Get compliance records
    const { data: records, error } = await supabase
      .from('compliance_records')
      .select('*')
      .eq('org_id', orgId)
      .order('checked_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch compliance records:', error)
      return createErrorResponse(
        'Failed to fetch compliance records',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    // Calculate compliance status
    let overallStatus: 'compliant' | 'warning' | 'non_compliant' = 'compliant'
    let nonCompliantCount = 0
    let warningCount = 0

    records?.forEach((record: any) => {
      if (record.status === 'non_compliant') {
        nonCompliantCount++
      } else if (record.status === 'warning') {
        warningCount++
      }
    })

    if (nonCompliantCount > 0) {
      overallStatus = 'non_compliant'
    } else if (warningCount > 0) {
      overallStatus = 'warning'
    }

    // Get certification expiration stats
    const { data: certs } = await supabase
      .from('certifications')
      .select('expires_at, passed')
      .eq('org_id', orgId)

    let expiredCount = 0
    let expiringCount = 0
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    certs?.forEach((cert: any) => {
      if (cert.expires_at && cert.passed) {
        const expiresAt = new Date(cert.expires_at)
        if (expiresAt < now) {
          expiredCount++
        } else if (expiresAt < thirtyDaysFromNow) {
          expiringCount++
        }
      }
    })

    return createSuccessResponse({
      compliance_status: overallStatus,
      summary: {
        total_records: records?.length || 0,
        non_compliant: nonCompliantCount,
        warnings: warningCount,
        compliant: (records?.length || 0) - nonCompliantCount - warningCount,
      },
      certification_stats: {
        expired: expiredCount,
        expiring_soon: expiringCount,
      },
      records: records || [],
    })
  } catch (error) {
    console.error('GET /api/compliance error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

// POST /api/compliance - Create compliance record
export async function POST(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams
    const orgId = searchParams.get('org_id')

    if (!orgId) {
      return createErrorResponse(
        'Organization ID is required',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST
      )
    }

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
    const validation = complianceRecordSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST,
        validation.error.flatten()
      )
    }

    const supabase = await createClient()

    // Create compliance record
    const { data: record, error } = await supabase
      .from('compliance_records')
      .insert({
        org_id: orgId,
        type: validation.data.type,
        status: validation.data.status,
        details: validation.data.details,
        checked_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error || !record) {
      console.error('Failed to create compliance record:', error)
      return createErrorResponse(
        'Failed to create compliance record',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    return createSuccessResponse(
      record,
      'Compliance record created successfully',
      HTTP_STATUS.CREATED
    )
  } catch (error) {
    console.error('POST /api/compliance error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
