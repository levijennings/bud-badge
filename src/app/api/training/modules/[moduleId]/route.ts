import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSuccessResponse,
  createErrorResponse,
  requireAuth,
  HTTP_STATUS,
} from '@/lib/api-helpers'

// GET /api/training/modules/[moduleId] - Get module with content and quiz
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params
    const { user, response: authResponse } = await requireAuth(request)
    if (!user) {
      return authResponse
    }

    const supabase = await createClient()

    // Get module
    const { data: module, error: moduleError } = await supabase
      .from('training_modules')
      .select('*')
      .eq('id', moduleId)
      .single()

    if (moduleError || !module) {
      return createErrorResponse(
        'Module not found',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    // Check plan access
    const { data: memberData } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    if (memberData) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('plan')
        .eq('id', memberData.org_id)
        .single()

      const PREMIUM_MODULES = ['advanced_compliance', 'custom_training']
      const isPremiumModule = PREMIUM_MODULES.some((premium) => moduleId.includes(premium))

      if (isPremiumModule && orgData?.plan === 'starter') {
        return createErrorResponse(
          'This module requires a Professional or Enterprise plan',
          'PLAN_RESTRICTED',
          HTTP_STATUS.FORBIDDEN
        )
      }
    }

    // Get content blocks
    const { data: contentBlocks } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('module_id', moduleId)
      .order('order', { ascending: true })

    // Get quiz questions
    const { data: quizQuestions } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('module_id', moduleId)
      .order('order', { ascending: true })

    // Get user's progress for this module
    const { data: userProgress } = await supabase
      .from('training_progress')
      .select('*')
      .eq('module_id', moduleId)
      .eq('user_id', user.id)
      .single()

    return createSuccessResponse({
      id: module.id,
      title: module.title,
      description: module.description,
      category: module.category,
      difficulty: module.difficulty,
      duration_minutes: module.duration_minutes,
      passing_score: module.passing_score,
      state_requirements: module.state_requirements || [],
      created_at: module.created_at,
      content_blocks: contentBlocks || [],
      quiz: {
        questions: quizQuestions || [],
      },
      user_progress: userProgress || {
        progress_pct: 0,
        status: 'not_started',
      },
    })
  } catch (error) {
    console.error('GET /api/training/modules/[moduleId] error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
