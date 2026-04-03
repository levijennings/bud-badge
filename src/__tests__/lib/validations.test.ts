import { describe, it, expect } from 'vitest'
import {
  orgCreateSchema,
  orgUpdateSchema,
  memberInviteSchema,
  memberUpdateSchema,
  profileUpdateSchema,
  trainingProgressSchema,
  quizAttemptSchema,
  complianceRecordSchema,
  billingCheckoutSchema,
  paginationSchema,
} from '@/lib/validations'

describe('Organization Schemas', () => {
  describe('orgCreateSchema', () => {
    it('should validate correct org creation data', () => {
      const data = {
        name: 'Test Org',
        slug: 'test-org',
        state: 'CO',
        city: 'Denver',
        plan: 'professional',
      }
      const result = orgCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const data = {
        name: 'Test Org',
        slug: 'test-org',
      }
      const result = orgCreateSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should validate slug format', () => {
      const validSlug = {
        name: 'Test Org',
        slug: 'valid-slug-123',
        state: 'CO',
        city: 'Denver',
      }
      expect(orgCreateSchema.safeParse(validSlug).success).toBe(true)

      const invalidSlug = {
        name: 'Test Org',
        slug: 'INVALID_SLUG',
        state: 'CO',
        city: 'Denver',
      }
      expect(orgCreateSchema.safeParse(invalidSlug).success).toBe(false)
    })

    it('should validate state code length', () => {
      const validState = {
        name: 'Test Org',
        slug: 'test-org',
        state: 'CO',
        city: 'Denver',
      }
      expect(orgCreateSchema.safeParse(validState).success).toBe(true)

      const invalidState = {
        name: 'Test Org',
        slug: 'test-org',
        state: 'COLORADO',
        city: 'Denver',
      }
      expect(orgCreateSchema.safeParse(invalidState).success).toBe(false)
    })

    it('should accept optional license_number', () => {
      const data = {
        name: 'Test Org',
        slug: 'test-org',
        state: 'CO',
        city: 'Denver',
        license_number: 'LIC-123456',
      }
      const result = orgCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should default plan to starter', () => {
      const data = {
        name: 'Test Org',
        slug: 'test-org',
        state: 'CO',
        city: 'Denver',
      }
      const result = orgCreateSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.data?.plan).toBe('starter')
    })
  })

  describe('orgUpdateSchema', () => {
    it('should validate partial updates', () => {
      const data = { name: 'Updated Name' }
      expect(orgUpdateSchema.safeParse(data).success).toBe(true)

      const data2 = { state: 'WA', city: 'Seattle' }
      expect(orgUpdateSchema.safeParse(data2).success).toBe(true)
    })

    it('should allow empty object', () => {
      expect(orgUpdateSchema.safeParse({}).success).toBe(true)
    })
  })
})

describe('Member Schemas', () => {
  describe('memberInviteSchema', () => {
    it('should validate correct member invite', () => {
      const data = {
        email: 'employee@example.com',
        role: 'budtender',
      }
      expect(memberInviteSchema.safeParse(data).success).toBe(true)
    })

    it('should reject invalid email', () => {
      const data = {
        email: 'not-an-email',
        role: 'manager',
      }
      expect(memberInviteSchema.safeParse(data).success).toBe(false)
    })

    it('should validate role enum', () => {
      const validRoles = ['owner', 'manager', 'budtender']
      validRoles.forEach((role) => {
        expect(
          memberInviteSchema.safeParse({
            email: 'test@example.com',
            role,
          }).success
        ).toBe(true)
      })

      expect(
        memberInviteSchema.safeParse({
          email: 'test@example.com',
          role: 'invalid-role',
        }).success
      ).toBe(false)
    })
  })

  describe('memberUpdateSchema', () => {
    it('should validate role update', () => {
      expect(
        memberUpdateSchema.safeParse({ role: 'manager' }).success
      ).toBe(true)
    })
  })
})

describe('Profile Schema', () => {
  describe('profileUpdateSchema', () => {
    it('should validate profile update', () => {
      const data = {
        display_name: 'John Doe',
        email: 'john@example.com',
      }
      expect(profileUpdateSchema.safeParse(data).success).toBe(true)
    })

    it('should allow partial updates', () => {
      expect(profileUpdateSchema.safeParse({ display_name: 'Jane' }).success).toBe(true)
      expect(profileUpdateSchema.safeParse({ email: 'jane@example.com' }).success).toBe(true)
    })

    it('should validate email format', () => {
      expect(
        profileUpdateSchema.safeParse({ email: 'invalid-email' }).success
      ).toBe(false)
    })
  })
})

describe('Training Schemas', () => {
  describe('trainingProgressSchema', () => {
    it('should validate correct progress data', () => {
      const data = {
        module_id: '550e8400-e29b-41d4-a716-446655440000',
        progress_pct: 50,
        status: 'in_progress',
      }
      expect(trainingProgressSchema.safeParse(data).success).toBe(true)
    })

    it('should validate progress percentage range', () => {
      expect(
        trainingProgressSchema.safeParse({
          module_id: '550e8400-e29b-41d4-a716-446655440000',
          progress_pct: 0,
          status: 'not_started',
        }).success
      ).toBe(true)

      expect(
        trainingProgressSchema.safeParse({
          module_id: '550e8400-e29b-41d4-a716-446655440000',
          progress_pct: 100,
          status: 'completed',
        }).success
      ).toBe(true)

      expect(
        trainingProgressSchema.safeParse({
          module_id: '550e8400-e29b-41d4-a716-446655440000',
          progress_pct: 101,
          status: 'in_progress',
        }).success
      ).toBe(false)
    })

    it('should validate status enum', () => {
      const statuses = ['not_started', 'in_progress', 'completed']
      statuses.forEach((status) => {
        expect(
          trainingProgressSchema.safeParse({
            module_id: '550e8400-e29b-41d4-a716-446655440000',
            progress_pct: 50,
            status,
          }).success
        ).toBe(true)
      })
    })
  })

  describe('quizAttemptSchema', () => {
    it('should validate correct quiz attempt', () => {
      const data = {
        quiz_id: '550e8400-e29b-41d4-a716-446655440000',
        answers: [
          { question_id: '550e8400-e29b-41d4-a716-446655440001', selected_answer: 0 },
          { question_id: '550e8400-e29b-41d4-a716-446655440002', selected_answer: 1 },
        ],
        time_taken_seconds: 300,
      }
      expect(quizAttemptSchema.safeParse(data).success).toBe(true)
    })

    it('should reject invalid UUID', () => {
      const data = {
        quiz_id: 'not-a-uuid',
        answers: [],
        time_taken_seconds: 300,
      }
      expect(quizAttemptSchema.safeParse(data).success).toBe(false)
    })

    it('should require answer arrays', () => {
      const data = {
        quiz_id: '550e8400-e29b-41d4-a716-446655440000',
        answers: [],
        time_taken_seconds: 300,
      }
      expect(quizAttemptSchema.safeParse(data).success).toBe(true)
    })
  })
})

describe('Compliance Schema', () => {
  describe('complianceRecordSchema', () => {
    it('should validate correct compliance record', () => {
      const data = {
        type: 'inventory_audit',
        status: 'compliant',
        details: 'All items accounted for',
      }
      expect(complianceRecordSchema.safeParse(data).success).toBe(true)
    })

    it('should validate status enum', () => {
      const statuses = ['compliant', 'warning', 'non_compliant']
      statuses.forEach((status) => {
        expect(
          complianceRecordSchema.safeParse({
            type: 'audit',
            status,
            details: 'Details here',
          }).success
        ).toBe(true)
      })
    })
  })
})

describe('Billing Schema', () => {
  describe('billingCheckoutSchema', () => {
    it('should validate billing plans', () => {
      const plans = ['starter', 'professional', 'enterprise']
      plans.forEach((plan) => {
        expect(
          billingCheckoutSchema.safeParse({ plan }).success
        ).toBe(true)
      })
    })

    it('should reject invalid plan', () => {
      expect(
        billingCheckoutSchema.safeParse({ plan: 'custom' }).success
      ).toBe(false)
    })
  })
})

describe('Pagination Schema', () => {
  describe('paginationSchema', () => {
    it('should validate pagination with defaults', () => {
      const result = paginationSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(10)
      }
    })

    it('should parse string numbers correctly', () => {
      const result = paginationSchema.safeParse({
        page: '2',
        limit: '20',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(2)
        expect(result.data.limit).toBe(20)
      }
    })

    it('should accept optional filters', () => {
      const result = paginationSchema.safeParse({
        page: '1',
        limit: '10',
        search: 'compliance',
        category: 'compliance',
        difficulty: 'beginner',
      })
      expect(result.success).toBe(true)
    })
  })
})
