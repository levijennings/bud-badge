import { z } from 'zod'

// Organization Schemas
export const orgCreateSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, 'Invalid slug format'),
  license_number: z.string().optional(),
  state: z.string().min(2).max(2, 'State must be 2-letter code'),
  city: z.string().min(1).max(255),
  plan: z.enum(['starter', 'professional', 'enterprise']).default('starter'),
})

export const orgUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  license_number: z.string().optional(),
  state: z.string().min(2).max(2).optional(),
  city: z.string().min(1).max(255).optional(),
})

// Member Schemas
export const memberInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'manager', 'budtender']),
})

export const memberUpdateSchema = z.object({
  role: z.enum(['owner', 'manager', 'budtender']),
})

// Profile Schemas
export const profileUpdateSchema = z.object({
  display_name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
})

// Training Progress Schemas
export const trainingProgressSchema = z.object({
  module_id: z.string().uuid('Invalid module ID'),
  progress_pct: z
    .number()
    .min(0)
    .max(100, 'Progress must be between 0 and 100'),
  status: z.enum(['not_started', 'in_progress', 'completed']),
})

// Quiz Attempt Schema
export const quizAttemptSchema = z.object({
  quiz_id: z.string().uuid('Invalid quiz ID'),
  answers: z.array(
    z.object({
      question_id: z.string().uuid('Invalid question ID'),
      selected_answer: z.number().min(0, 'Invalid answer index'),
    })
  ),
  time_taken_seconds: z.number().min(0, 'Time taken must be positive'),
})

// Compliance Record Schema
export const complianceRecordSchema = z.object({
  type: z.string().min(1).max(255),
  status: z.enum(['compliant', 'warning', 'non_compliant']),
  details: z.string().min(1),
})

// Billing Schema
export const billingCheckoutSchema = z.object({
  plan: z.enum(['starter', 'professional', 'enterprise']),
})

// Pagination Schema
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  search: z.string().optional(),
  category: z.enum(['compliance', 'product_knowledge', 'customer_service', 'safety']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
})

export type OrgCreateInput = z.infer<typeof orgCreateSchema>
export type OrgUpdateInput = z.infer<typeof orgUpdateSchema>
export type MemberInviteInput = z.infer<typeof memberInviteSchema>
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type TrainingProgressInput = z.infer<typeof trainingProgressSchema>
export type QuizAttemptInput = z.infer<typeof quizAttemptSchema>
export type ComplianceRecordInput = z.infer<typeof complianceRecordSchema>
export type BillingCheckoutInput = z.infer<typeof billingCheckoutSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
