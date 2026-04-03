import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSuccessResponse,
  createErrorResponse,
  requireOrgRole,
  HTTP_STATUS,
} from '@/lib/api-helpers'

// GET /api/dashboard/stats - Get organization dashboard statistics
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
      ['owner', 'manager']
    )

    if (!authorized) {
      return authResponse
    }

    const supabase = await createClient()

    // Get organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()

    if (!org) {
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

    // Get training progress stats
    const { data: progressData } = await supabase
      .from('training_progress')
      .select('user_id, progress_pct, status, module_id')
      .eq('org_id', orgId)

    let avgCompletion = 0
    let completedCount = 0
    let inProgressCount = 0

    if (progressData && progressData.length > 0) {
      const uniqueUsers = new Set(progressData.map((p: any) => p.user_id))
      const userProgressMap = new Map<string, any[]>()

      progressData.forEach((p: any) => {
        if (!userProgressMap.has(p.user_id)) {
          userProgressMap.set(p.user_id, [])
        }
        userProgressMap.get(p.user_id)!.push(p)
      })

      let totalProgress = 0
      userProgressMap.forEach((userProgress) => {
        const userAvg =
          userProgress.reduce((sum: number, p: any) => sum + p.progress_pct, 0) /
          userProgress.length
        totalProgress += userAvg
      })

      avgCompletion = Math.round(totalProgress / uniqueUsers.size)
      completedCount = progressData.filter((p: any) => p.status === 'completed').length
      inProgressCount = progressData.filter((p: any) => p.status === 'in_progress').length
    }

    // Get certification stats
    const { data: certifications } = await supabase
      .from('certifications')
      .select('*')
      .eq('org_id', orgId)

    let activeCerts = 0
    let expiredCerts = 0
    const now = new Date()

    certifications?.forEach((cert: any) => {
      if (cert.expires_at) {
        const expiresAt = new Date(cert.expires_at)
        if (expiresAt < now) {
          expiredCerts++
        } else {
          activeCerts++
        }
      } else {
        activeCerts++
      }
    })

    // Get compliance records
    const { data: complianceRecords } = await supabase
      .from('compliance_records')
      .select('status')
      .eq('org_id', orgId)
      .order('checked_at', { ascending: false })
      .limit(10)

    let complianceStatus: 'compliant' | 'warning' | 'non_compliant' = 'compliant'
    if (complianceRecords && complianceRecords.length > 0) {
      const nonCompliant = complianceRecords.some((r: any) => r.status === 'non_compliant')
      if (nonCompliant) {
        complianceStatus = 'non_compliant'
      } else {
        const hasWarning = complianceRecords.some((r: any) => r.status === 'warning')
        if (hasWarning) {
          complianceStatus = 'warning'
        }
      }
    }

    // Get recent quiz attempts for activity
    const { data: recentActivity } = await supabase
      .from('quiz_attempts')
      .select('*, profiles:user_id(display_name), training_modules(title)')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get module completion breakdown
    const { data: moduleStats } = await supabase
      .from('training_progress')
      .select('module_id, status, training_modules(title, category)')
      .eq('org_id', orgId)

    const categoryStats: Record<string, { total: number; completed: number }> = {}
    moduleStats?.forEach((stat: any) => {
      const category = stat.training_modules?.category || 'unknown'
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, completed: 0 }
      }
      categoryStats[category].total++
      if (stat.status === 'completed') {
        categoryStats[category].completed++
      }
    })

    const categoryBreakdown = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      total: stats.total,
      completed: stats.completed,
      completion_rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    }))

    return createSuccessResponse({
      organization: {
        id: org.id,
        name: org.name,
        plan: org.plan,
      },
      employees: {
        total: memberCount || 0,
        max: org.max_employees,
        utilization: memberCount && org.max_employees ?
          Math.round((memberCount / org.max_employees) * 100) : 0,
      },
      training: {
        average_completion: avgCompletion,
        modules_in_progress: inProgressCount,
        modules_completed: completedCount,
      },
      certifications: {
        active: activeCerts,
        expired: expiredCerts,
        total: activeCerts + expiredCerts,
      },
      compliance: {
        status: complianceStatus,
        records: complianceRecords?.length || 0,
      },
      category_breakdown: categoryBreakdown,
      recent_activity: (recentActivity || []).map((activity: any) => ({
        id: activity.id,
        user_name: activity.profiles?.display_name,
        module_title: activity.training_modules?.title,
        score: activity.percentage,
        passed: activity.passed,
        timestamp: activity.created_at,
      })),
    })
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
