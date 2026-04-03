import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSuccessResponse,
  createErrorResponse,
  requireAuth,
  parsePagination,
  HTTP_STATUS,
} from '@/lib/api-helpers'

// Premium content requires at least 'professional' plan
const PREMIUM_MODULES = ['advanced_compliance', 'custom_training']

// GET /api/training/modules - List training modules
export async function GET(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request)
    if (!user) {
      return authResponse
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, offset, search, category, difficulty, error: paginationError } =
      parsePagination(Object.fromEntries(searchParams))

    if (paginationError) {
      return createErrorResponse(
        'Invalid pagination parameters',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const supabase = await createClient()

    // Get user's organization to check plan
    const { data: memberData } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    let orgPlan = 'starter'
    if (memberData) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('plan')
        .eq('id', memberData.org_id)
        .single()

      if (orgData) {
        orgPlan = orgData.plan
      }
    }

    // Build query
    let query = supabase
      .from('training_modules')
      .select('*, training_progress(user_id)', { count: 'exact' })

    // Filter by category
    if (category) {
      query = query.eq('category', category)
    }

    // Filter by difficulty
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    // Filter by search
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: modules, count, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch modules:', error)
      return createErrorResponse(
        'Failed to fetch modules',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    // Filter modules based on plan
    const filteredModules =
      modules?.filter((module: any) => {
        // Check if module requires premium plan
        const isPremiumModule = PREMIUM_MODULES.some((premium) =>
          module.id.includes(premium)
        )

        // Allow access if not premium or user has professional/enterprise plan
        if (isPremiumModule && orgPlan === 'starter') {
          return false
        }

        return true
      }) || []

    // Format response with completion info
    const modulesWithProgress = filteredModules.map((module: any) => ({
      ...module,
      user_completed: module.training_progress?.some(
        (p: any) => p.user_id === user.id
      ) || false,
      // Remove nested data from response
      training_progress: undefined,
    }))

    return createSuccessResponse({
      modules: modulesWithProgress,
      pagination: {
        page,
        limit,
        total: filteredModules.length,
        pages: Math.ceil(filteredModules.length / limit),
      },
      plan_restrictions: orgPlan === 'starter',
    })
  } catch (error) {
    console.error('GET /api/training/modules error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
