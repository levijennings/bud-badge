import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createSuccessResponse,
  createErrorResponse,
  HTTP_STATUS,
  calculateModuleScore,
  parsePagination,
} from '@/lib/api-helpers'

describe('API Helpers', () => {
  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { id: '123', name: 'Test' }
      const response = createSuccessResponse(data)

      expect(response.status).toBe(200)
    })

    it('should include message when provided', () => {
      const data = { id: '123' }
      const response = createSuccessResponse(data, 'Created successfully', HTTP_STATUS.CREATED)

      expect(response.status).toBe(201)
    })

    it('should use custom status code', () => {
      const response = createSuccessResponse({}, undefined, HTTP_STATUS.CREATED)
      expect(response.status).toBe(201)
    })
  })

  describe('createErrorResponse', () => {
    it('should create error response', () => {
      const response = createErrorResponse(
        'Not found',
        'NOT_FOUND',
        HTTP_STATUS.NOT_FOUND
      )

      expect(response.status).toBe(404)
    })

    it('should include details when provided', () => {
      const details = { field: 'email', reason: 'already exists' }
      const response = createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        HTTP_STATUS.BAD_REQUEST,
        details
      )

      expect(response.status).toBe(400)
    })

    it('should use internal server error as default', () => {
      const response = createErrorResponse('Error', 'UNKNOWN_ERROR')
      expect(response.status).toBe(500)
    })
  })

  describe('HTTP_STATUS constants', () => {
    it('should have correct status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200)
      expect(HTTP_STATUS.CREATED).toBe(201)
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400)
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401)
      expect(HTTP_STATUS.FORBIDDEN).toBe(403)
      expect(HTTP_STATUS.NOT_FOUND).toBe(404)
      expect(HTTP_STATUS.CONFLICT).toBe(409)
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500)
    })
  })

  describe('calculateModuleScore', () => {
    it('should calculate correct score', () => {
      const answers = [
        { question_id: 'q1', selected_answer: 0 },
        { question_id: 'q2', selected_answer: 1 },
      ]
      const correctAnswers = { q1: 0, q2: 1 }

      const result = calculateModuleScore(answers, correctAnswers)

      expect(result.score).toBe(2)
      expect(result.percentage).toBe(100)
    })

    it('should calculate partial correct answers', () => {
      const answers = [
        { question_id: 'q1', selected_answer: 0 },
        { question_id: 'q2', selected_answer: 0 },
      ]
      const correctAnswers = { q1: 0, q2: 1 }

      const result = calculateModuleScore(answers, correctAnswers)

      expect(result.score).toBe(1)
      expect(result.percentage).toBe(50)
    })

    it('should handle all incorrect answers', () => {
      const answers = [
        { question_id: 'q1', selected_answer: 1 },
        { question_id: 'q2', selected_answer: 2 },
      ]
      const correctAnswers = { q1: 0, q2: 1 }

      const result = calculateModuleScore(answers, correctAnswers)

      expect(result.score).toBe(0)
      expect(result.percentage).toBe(0)
    })

    it('should handle empty answers', () => {
      const result = calculateModuleScore([], {})
      expect(result.score).toBe(0)
      expect(result.percentage).toBe(0)
    })

    it('should round percentage correctly', () => {
      const answers = [
        { question_id: 'q1', selected_answer: 0 },
        { question_id: 'q2', selected_answer: 0 },
        { question_id: 'q3', selected_answer: 0 },
      ]
      const correctAnswers = { q1: 0, q2: 1, q3: 1 }

      const result = calculateModuleScore(answers, correctAnswers)

      expect(result.score).toBe(1)
      expect(result.percentage).toBe(33) // 1/3 = 0.333...
    })
  })

  describe('parsePagination', () => {
    it('should parse valid pagination params', () => {
      const result = parsePagination({
        page: '2',
        limit: '20',
      })

      expect(result.page).toBe(2)
      expect(result.limit).toBe(20)
      expect(result.offset).toBe(20)
    })

    it('should use defaults', () => {
      const result = parsePagination({})

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.offset).toBe(0)
    })

    it('should handle array search params', () => {
      const result = parsePagination({
        page: ['2'],
        limit: ['20'],
      })

      expect(result.page).toBe(2)
      expect(result.limit).toBe(20)
    })

    it('should enforce min page of 1', () => {
      const result = parsePagination({
        page: '0',
      })

      expect(result.page).toBe(1)
    })

    it('should enforce max limit of 100', () => {
      const result = parsePagination({
        limit: '200',
      })

      expect(result.limit).toBe(100)
    })

    it('should enforce min limit of 1', () => {
      const result = parsePagination({
        limit: '0',
      })

      expect(result.limit).toBe(1)
    })

    it('should parse optional filters', () => {
      const result = parsePagination({
        page: '1',
        limit: '10',
        search: 'compliance',
        category: 'compliance',
        difficulty: 'beginner',
      })

      expect(result.search).toBe('compliance')
      expect(result.category).toBe('compliance')
      expect(result.difficulty).toBe('beginner')
    })

    it('should handle invalid input gracefully', () => {
      const result = parsePagination({
        page: 'invalid',
        limit: 'invalid',
      })

      expect(result.error).toBeDefined()
    })
  })
})
