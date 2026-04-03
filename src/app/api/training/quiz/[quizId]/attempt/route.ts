import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSuccessResponse,
  createErrorResponse,
  requireAuth,
  calculateModuleScore,
  HTTP_STATUS,
} from '@/lib/api-helpers'
import { quizAttemptSchema } from '@/lib/validations'

// POST /api/training/quiz/[quizId]/attempt - Submit quiz attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params
    const { user, response: authResponse } = await requireAuth(request)
    if (!user) {
      return authResponse
    }

    const body = await request.json()

    // Validate input
    const validation = quizAttemptSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST,
        validation.error.flatten()
      )
    }

    const supabase = await createClient()

    // Get quiz/module details
    const { data: module, error: moduleError } = await supabase
      .from('training_modules')
      .select('*')
      .eq('id', quizId)
      .single()

    if (moduleError || !module) {
      return createErrorResponse(
        'Quiz/Module not found',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    // Get all quiz questions with correct answers
    const { data: quizQuestions } = await supabase
      .from('quiz_questions')
      .select('id, correct_answer')
      .eq('module_id', quizId)

    if (!quizQuestions || quizQuestions.length === 0) {
      return createErrorResponse(
        'No questions found for this quiz',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )
    }

    // Create correct answers map
    const correctAnswersMap: Record<string, number> = {}
    quizQuestions.forEach((q: any) => {
      correctAnswersMap[q.id] = q.correct_answer
    })

    // Calculate score
    const { score, percentage } = calculateModuleScore(
      validation.data.answers,
      correctAnswersMap
    )

    // Determine if passed
    const passed = percentage >= module.passing_score

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

    // Save quiz attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        org_id: memberData.org_id,
        module_id: quizId,
        score,
        percentage,
        passed,
        answers: validation.data.answers,
        time_taken_seconds: validation.data.time_taken_seconds,
      })
      .select()
      .single()

    if (attemptError || !attempt) {
      console.error('Failed to save quiz attempt:', attemptError)
      return createErrorResponse(
        'Failed to save quiz attempt',
        'DATABASE_ERROR',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    // Update training progress
    const { data: progress } = await supabase
      .from('training_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('module_id', quizId)
      .single()

    if (progress) {
      await supabase
        .from('training_progress')
        .update({
          progress_pct: 100,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', progress.id)
    } else {
      await supabase.from('training_progress').insert({
        user_id: user.id,
        org_id: memberData.org_id,
        module_id: quizId,
        progress_pct: 100,
        status: 'completed',
      })
    }

    let certification = null

    // If passed, create certification
    if (passed) {
      // Calculate expiration date (1 year from now for compliance modules)
      const expiresAt =
        module.category === 'compliance'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : null

      const { data: cert, error: certError } = await supabase
        .from('certifications')
        .insert({
          user_id: user.id,
          org_id: memberData.org_id,
          module_id: quizId,
          score: percentage,
          passed: true,
          ...(expiresAt && { expires_at: expiresAt.toISOString() }),
        })
        .select()
        .single()

      if (!certError && cert) {
        certification = cert
      }
    }

    return createSuccessResponse(
      {
        attempt,
        passed,
        score,
        percentage,
        passing_score: module.passing_score,
        certification: passed ? certification : null,
      },
      'Quiz submitted successfully'
    )
  } catch (error) {
    console.error('POST /api/training/quiz/[quizId]/attempt error:', error)
    return createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
