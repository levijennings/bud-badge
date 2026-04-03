import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paginationSchema, type PaginationInput } from '@/lib/validations'

// Response Types
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code: string
  details?: any
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Create Success Response
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = HTTP_STATUS.OK
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  )
}

// Create Error Response
export function createErrorResponse(
  error: string,
  code: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      ...(details && { details }),
    },
    { status }
  )
}

// Get User from Request
export async function getUserFromRequest(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error }
  }

  return { user, error: null }
}

// Get User Profile
export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

// Get User's Organization
export async function getUserOrganization(userId: string) {
  const supabase = await createClient()

  // Get user's org_id through org_members table
  const { data: memberData, error: memberError } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', userId)
    .single()

  if (memberError || !memberData) {
    return { org: null, role: null, error: memberError }
  }

  // Get organization details
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', memberData.org_id)
    .single()

  return {
    org: orgData,
    role: memberData.role,
    error: orgError,
  }
}

// Require Authentication
export async function requireAuth(request: NextRequest) {
  const { user, error } = await getUserFromRequest(request)

  if (!user || error) {
    return {
      authenticated: false,
      user: null,
      response: createErrorResponse(
        'Unauthorized',
        'UNAUTHORIZED',
        HTTP_STATUS.UNAUTHORIZED
      ),
    }
  }

  return { authenticated: true, user, response: null }
}

// Require Organization Membership
export async function requireOrgMember(request: NextRequest, orgId: string) {
  const { user, error: authError } = await getUserFromRequest(request)

  if (!user || authError) {
    return {
      authorized: false,
      user: null,
      member: null,
      response: createErrorResponse(
        'Unauthorized',
        'UNAUTHORIZED',
        HTTP_STATUS.UNAUTHORIZED
      ),
    }
  }

  const supabase = await createClient()
  const { data: member, error } = await supabase
    .from('org_members')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (error || !member) {
    return {
      authorized: false,
      user,
      member: null,
      response: createErrorResponse(
        'Forbidden',
        'FORBIDDEN',
        HTTP_STATUS.FORBIDDEN
      ),
    }
  }

  return { authorized: true, user, member, response: null }
}

// Require Organization Role
export async function requireOrgRole(
  request: NextRequest,
  orgId: string,
  requiredRoles: ('owner' | 'manager' | 'budtender')[]
) {
  const { authorized, user, member, response } = await requireOrgMember(
    request,
    orgId
  )

  if (!authorized || !member) {
    return { authorized: false, user, member, response }
  }

  if (!requiredRoles.includes(member.role)) {
    return {
      authorized: false,
      user,
      member,
      response: createErrorResponse(
        'Insufficient permissions',
        'INSUFFICIENT_PERMISSIONS',
        HTTP_STATUS.FORBIDDEN
      ),
    }
  }

  return { authorized: true, user, member, response: null }
}

// Parse Pagination
export function parsePagination(searchParams: Record<string, string | string[] | undefined>) {
  try {
    const result = paginationSchema.parse({
      page: Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page,
      limit: Array.isArray(searchParams.limit) ? searchParams.limit[0] : searchParams.limit,
      search: Array.isArray(searchParams.search) ? searchParams.search[0] : searchParams.search,
      category: Array.isArray(searchParams.category) ? searchParams.category[0] : searchParams.category,
      difficulty: Array.isArray(searchParams.difficulty) ? searchParams.difficulty[0] : searchParams.difficulty,
    })

    const page = Math.max(1, result.page)
    const limit = Math.min(100, Math.max(1, result.limit))
    const offset = (page - 1) * limit

    return {
      page,
      limit,
      offset,
      search: result.search,
      category: result.category,
      difficulty: result.difficulty,
      error: null,
    }
  } catch (error) {
    return {
      page: 1,
      limit: 10,
      offset: 0,
      search: undefined,
      category: undefined,
      difficulty: undefined,
      error,
    }
  }
}

// Calculate Module Passing Score
export function calculateModuleScore(
  answers: Array<{ question_id: string; selected_answer: number }>,
  correctAnswers: Record<string, number>
): { score: number; percentage: number } {
  let correct = 0
  const total = Object.keys(correctAnswers).length

  answers.forEach(({ question_id, selected_answer }) => {
    if (correctAnswers[question_id] === selected_answer) {
      correct++
    }
  })

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

  return {
    score: correct,
    percentage,
  }
}
