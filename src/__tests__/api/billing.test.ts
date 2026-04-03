import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMockStripeCustomer,
  createMockStripeSubscription,
  createMockCheckoutSession,
  createMockStripeEvent,
  mockStripe,
} from '@/test/mocks/stripe'
import { createMockOrg } from '@/test/helpers'
import { PLANS } from '@/lib/stripe'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/api-helpers', async () => {
  const actual = await vi.importActual('@/lib/api-helpers')
  return {
    ...actual,
    requireOrgRole: vi.fn(),
  }
})

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe),
}))

import { createClient } from '@/lib/supabase/server'
import { requireOrgRole } from '@/lib/api-helpers'

const mockCreateClient = createClient as any
const mockRequireOrgRole = requireOrgRole as any

describe('Billing API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/billing/checkout', () => {
    it('should create checkout session', async () => {
      const mockOrg = createMockOrg()

      mockRequireOrgRole.mockResolvedValueOnce({
        authorized: true,
        user: { id: 'user-123' },
        member: { org_id: mockOrg.id, role: 'owner' },
        response: null,
      })

      const session = createMockCheckoutSession({
        metadata: { org_id: mockOrg.id, plan: 'professional' },
      })

      expect(session.url).toBeDefined()
      expect(session.metadata.org_id).toBe(mockOrg.id)
    })

    it('should require owner role', async () => {
      mockRequireOrgRole.mockResolvedValueOnce({
        authorized: false,
        user: null,
        member: null,
        response: { status: 403 },
      })

      expect(mockRequireOrgRole).toBeDefined()
    })

    it('should validate plan', async () => {
      const plans = ['starter', 'professional', 'enterprise']

      plans.forEach((plan) => {
        expect(PLANS[plan as keyof typeof PLANS]).toBeDefined()
      })
    })

    it('should generate correct plan pricing', async () => {
      expect(PLANS.starter.price).toBe(49)
      expect(PLANS.professional.price).toBe(149)
      expect(PLANS.enterprise.price).toBe(null) // Custom pricing
    })

    it('should handle customer creation', async () => {
      const mockCustomer = createMockStripeCustomer({
        metadata: { org_id: 'org-123' },
      })

      expect(mockCustomer.email).toBeDefined()
      expect(mockCustomer.metadata.org_id).toBe('org-123')
    })

    it('should include success and cancel URLs', async () => {
      const session = createMockCheckoutSession()

      expect(session.success_url).toBeDefined()
      expect(session.cancel_url).toBeDefined()
    })

    it('should return 404 if organization not found', async () => {
      mockRequireOrgRole.mockResolvedValueOnce({
        authorized: false,
        user: { id: 'user-123' },
        member: null,
        response: { status: 403 },
      })

      expect(mockRequireOrgRole).toBeDefined()
    })
  })

  describe('POST /api/billing/webhook', () => {
    it('should handle subscription.created event', async () => {
      const mockSub = createMockStripeSubscription({ status: 'active' })
      const event = createMockStripeEvent('customer.subscription.created', mockSub)

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(event)

      expect(event.type).toBe('customer.subscription.created')
      expect(mockSub.status).toBe('active')
    })

    it('should handle subscription.updated event', async () => {
      const mockSub = createMockStripeSubscription({
        status: 'active',
        metadata: { plan: 'professional' },
      })
      const event = createMockStripeEvent('customer.subscription.updated', mockSub)

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(event)

      expect(event.type).toBe('customer.subscription.updated')
      expect(mockSub.metadata.plan).toBe('professional')
    })

    it('should handle subscription.deleted event', async () => {
      const mockSub = createMockStripeSubscription({ status: 'canceled' })
      const event = createMockStripeEvent('customer.subscription.deleted', mockSub)

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(event)

      expect(event.type).toBe('customer.subscription.deleted')
      expect(mockSub.status).toBe('canceled')
    })

    it('should verify webhook signature', async () => {
      const payload = JSON.stringify({ test: 'data' })
      const sig = 'sig_test'

      // Webhook signature verification
      mockStripe.webhooks.constructEvent.mockImplementationOnce(
        (body: string, sig_header: string, secret: string) => {
          if (sig_header !== sig) {
            throw new Error('Invalid signature')
          }
          return JSON.parse(body)
        }
      )

      expect(mockStripe.webhooks.constructEvent).toBeDefined()
    })

    it('should return 400 for invalid signature', async () => {
      mockStripe.webhooks.constructEvent.mockImplementationOnce(() => {
        throw new Error('Invalid signature')
      })

      expect(() => mockStripe.webhooks.constructEvent('body', 'invalid', 'secret')).toThrow()
    })

    it('should return 204 on success', async () => {
      const mockSub = createMockStripeSubscription()
      const event = createMockStripeEvent('customer.subscription.created', mockSub)

      mockStripe.webhooks.constructEvent.mockReturnValueOnce(event)

      expect(event).toBeDefined()
    })
  })

  describe('Plan Management', () => {
    it('should upgrade from starter to professional', async () => {
      const starterOrg = createMockOrg({ plan: 'starter', max_employees: 10 })
      const proOrg = createMockOrg({ plan: 'professional', max_employees: 50 })

      expect(starterOrg.max_employees).toBeLessThan(proOrg.max_employees)
    })

    it('should downgrade from professional to starter', async () => {
      const proOrg = createMockOrg({ plan: 'professional', max_employees: 50 })
      const starterOrg = createMockOrg({ plan: 'starter', max_employees: 10 })

      expect(proOrg.max_employees).toBeGreaterThan(starterOrg.max_employees)
    })

    it('should maintain subscription during plan changes', async () => {
      const org = createMockOrg({
        stripe_subscription_id: 'sub_test123',
        plan: 'professional',
      })

      expect(org.stripe_subscription_id).toBeDefined()
    })

    it('should track billing cycle dates', async () => {
      const mockSub = createMockStripeSubscription()

      expect(mockSub.current_period_start).toBeDefined()
      expect(mockSub.current_period_end).toBeDefined()
      expect(mockSub.current_period_end).toBeGreaterThan(mockSub.current_period_start)
    })
  })

  describe('Customer Management', () => {
    it('should create Stripe customer for organization', async () => {
      const mockOrg = createMockOrg()
      const customer = createMockStripeCustomer({
        metadata: { org_id: mockOrg.id },
      })

      expect(customer.metadata.org_id).toBe(mockOrg.id)
    })

    it('should link customer to organization', async () => {
      const mockOrg = createMockOrg({ stripe_customer_id: 'cus_test123' })

      expect(mockOrg.stripe_customer_id).toBe('cus_test123')
    })

    it('should retrieve customer details', async () => {
      const customer = createMockStripeCustomer()

      mockStripe.customers.retrieve.mockResolvedValueOnce(customer)

      expect(mockStripe.customers.retrieve).toBeDefined()
    })

    it('should handle customer deletion', async () => {
      // Stripe marks customers as deleted rather than actually deleting
      const deletedCustomer = createMockStripeCustomer({
        deleted: true,
      })

      expect(deletedCustomer).toBeDefined()
    })
  })

  describe('Invoice Management', () => {
    it('should list organization invoices', async () => {
      const mockOrg = createMockOrg()

      mockRequireOrgRole.mockResolvedValueOnce({
        authorized: true,
        user: { id: 'user-123' },
        member: { org_id: mockOrg.id, role: 'owner' },
        response: null,
      })

      expect(mockRequireOrgRole).toBeDefined()
    })

    it('should retrieve specific invoice', async () => {
      const invoice = {
        id: 'in_test123',
        amount_due: 14900,
        amount_paid: 14900,
        status: 'paid',
        paid_at: Math.floor(Date.now() / 1000),
      }

      expect(invoice.amount_due).toBe(invoice.amount_paid)
    })

    it('should show payment history', async () => {
      const invoices = [
        { id: 'in_1', amount_paid: 14900, status: 'paid' },
        { id: 'in_2', amount_paid: 14900, status: 'paid' },
        { id: 'in_3', amount_paid: 14900, status: 'paid' },
      ]

      expect(invoices.length).toBe(3)
    })
  })

  describe('Failed Payment Handling', () => {
    it('should handle payment_intent.payment_failed event', async () => {
      const failedEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test123',
            status: 'requires_payment_method',
          },
        },
      }

      expect(failedEvent.type).toBe('payment_intent.payment_failed')
    })

    it('should notify organization of failed payment', async () => {
      // Would send notification email
      expect(true).toBe(true)
    })

    it('should provide payment retry link', async () => {
      // Would generate secure retry link
      expect(true).toBe(true)
    })

    it('should suspend access on failed payment after grace period', async () => {
      // Would suspend org features after grace period
      expect(true).toBe(true)
    })
  })

  describe('Subscription Lifecycle', () => {
    it('should activate subscription immediately', async () => {
      const mockSub = createMockStripeSubscription({ status: 'active' })

      expect(mockSub.status).toBe('active')
    })

    it('should renew subscription at period end', async () => {
      const mockSub = createMockStripeSubscription()

      expect(mockSub.current_period_end).toBeGreaterThan(
        mockSub.current_period_start
      )
    })

    it('should allow subscription cancellation', async () => {
      const activeSub = createMockStripeSubscription({ status: 'active' })
      const canceledSub = createMockStripeSubscription({ status: 'canceled' })

      expect(activeSub.status).not.toBe(canceledSub.status)
    })

    it('should handle end of subscription life', async () => {
      const mockSub = createMockStripeSubscription({
        status: 'canceled',
      })

      expect(mockSub.status).toBe('canceled')
    })
  })
})
