import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSuccessResponse,
  createErrorResponse,
  requireAuth,
  HTTP_STATUS,
} from '@/lib/api-helpers'
import { trainingProgressSchema } from '@/lib/validations'

// GET /api/training/progress - Get user's training progress
export async function GET(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request)
    if (!user) {
      return authResponse
    }

    const supabase = await createClient()

    // Get all user's progress
    const { data: progress, error } = await supabase
      .from('training_progress')
      .select('*, training_modules(title, category, difficulty)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch progress:', error)
      return createErrorResponse(
        'Failed to fetch progress',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    // Calculate statistics
    let totalModules = 0
    let completedModules = 0
    let averageProgress = 0

    if (progress && progress.length > 0) {
      totalModules = progress.length
      completedModules = progress.filter((p: any) => p.status === 'completed').length
      averageProgress = Math.round(
        progress.reduce((sum: number, p: any) => sum + p.progress_pct, 0) / totalModules
      )
    }

    return createSuccessResponse({
      progress: progress || [],
      statistics: {
        total_modules: totalModules,
        completed_modules: completedModules,
        in_progress_modules: progress?.filter((p: any) => p.status === 'in_progress').length || 0,
        average_progress: averageProgress,
        completion_rate: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
      },
    })
  } catch (error) {
    console.error('GET /api/training/progress error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

// POST /api/training/progress - Create or update training progress
export async function POST(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request)
    if (!user) {
      return authResponse
    }

    const body = await request.json()

    // Validate input
    const validation = trainingProgressSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST,
        validation.error.flatten()
      )
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

    // Verify module exists
    const { data: module } = await supabase
      .from('training_modules')
      .select('id')
      .eq('id', validation.data.module_id)
      .single()

    if (!module) {
      return createErrorResponse(
        'Module not found',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    // Check if progress already exists
    const { data: existingProgress } = await supabase
      .from('training_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('module_id', validation.data.module_id)
      .single()

    let result

    if (existingProgress) {
      // Update existing progress
      const { data: updatedProgress, error: updateError } = await supabase
        .from('training_progress')
        .update({
          progress_pct: validation.data.progress_pct,
          status: validation.data.status,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('module_id', validation.data.module_id)
        .select()
        .single()

      if (updateError || !updatedProgress) {
        console.error('Failed to update progress:', updateError)
        return createErrorResponse(
          'Failed to update progress',
          'DATABASE_ERROR',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      }

      result = updatedProgress
    } else {
      // Create new progress
      const { data: newProgress, error: createError } = await supabase
        .from('training_progress')
        .insert({
          user_id: user.id,
          org_id: memberData.org_id,
          module_id: validation.data.module_id,
          progress_pct: validation.data.progress_pct,
          status: validation.data.status,
        })
        .select()
        .single()

      if (createError || !newProgress) {
        console.error('Failed to create progress:', createError)
        return createErrorResponse(
          'Failed to create progress',
          'DATABASE_ERROR',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      }

      result = newProgress
    }

    return createSuccessResponse(
      result,
      'Progress updated successfully',
      existingProgress ? HTTP_STATUS.OK : HTTP_STATUS.CREATED
    )
  } catch (error) {
    console.error('POST /api/training/progress error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

// PATCH /api/training/progress - Update training progress
export async function PATCH(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request)
    if (!user) {
      return authResponse
    }

    const body = await request.json()

    // Validate input
    const validation = trainingProgressSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST,
        validation.error.flatten()
      )
    }

    const supabase = await createClient()

    // Verify progress exists
    const { data: progress } = await supabase
      .from('training_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('module_id', validation.data.module_id)
      .single()

    if (!progress) {
      return createErrorResponse(
        'Progress not found',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    // Update progress
    const { data: updatedProgress, error: updateError } = await supabase
      .from('training_progress')
      .update({
        progress_pct: validation.data.progress_pct,
        status: validation.data.status,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('module_id', validation.data.module_id)
      .select()
      .single()

    if (updateError || !updatedProgress) {
      console.error('Failed to update progress:', updateError)
      return createErrorResponse(
        'Failed to update progress',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    return createSuccessResponse(updatedProgress, 'Progress updated successfully')
  } catch (error) {
    console.error('PATCH /api/training/progress error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
