import { vi } from 'vitest'

export const mockStripeCustomer = {
  id: 'cus_test123',
  object: 'customer',
  email: 'test@example.com',
  metadata: {
    org_id: 'org-123',
  },
}

export const mockStripeSubscription = {
  id: 'sub_test123',
  object: 'subscription',
  customer: 'cus_test123',
  currency: 'usd',
  current_period_end: Math.floor(Date.now() / 1000) + 2592000,
  current_period_start: Math.floor(Date.now() / 1000),
  status: 'active' as const,
  items: {
    object: 'list',
    data: [
      {
        id: 'si_test123',
        price: {
          id: 'price_starter',
          product: 'prod_starter',
          unit_amount: 4900,
          recurring: {
            interval: 'month' as const,
            interval_count: 1,
          },
        },
      },
    ],
  },
  metadata: {
    plan: 'starter',
  },
}

export const mockCheckoutSession = {
  id: 'cs_test123',
  object: 'checkout.session',
  payment_status: 'unpaid',
  customer: 'cus_test123',
  client_secret: 'test_secret_123',
  success_url: 'http://localhost:3000/success',
  cancel_url: 'http://localhost:3000/cancel',
  status: 'open' as const,
  url: 'https://checkout.stripe.com/pay/test',
  metadata: {
    org_id: 'org-123',
    plan: 'starter',
  },
}

export function createMockStripeCustomer(overrides = {}) {
  return {
    ...mockStripeCustomer,
    ...overrides,
  }
}

export function createMockStripeSubscription(overrides = {}) {
  return {
    ...mockStripeSubscription,
    ...overrides,
  }
}

export function createMockCheckoutSession(overrides = {}) {
  return {
    ...mockCheckoutSession,
    ...overrides,
  }
}

export function createMockStripeEvent(type: string, data: any) {
  return {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2024-04-10',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: data,
    },
    livemode: false,
    pending_webhooks: 0,
    request: {
      id: null,
      idempotency_key: null,
    },
    type,
  }
}

export const mockStripe = {
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
  },
  subscriptions: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
    list: vi.fn(),
  },
  checkout: {
    sessions: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
  invoices: {
    list: vi.fn(),
    retrieve: vi.fn(),
  },
  paymentIntents: {
    create: vi.fn(),
  },
}

// Default mock implementations
mockStripe.customers.create.mockResolvedValue(mockStripeCustomer)
mockStripe.customers.retrieve.mockResolvedValue(mockStripeCustomer)
mockStripe.subscriptions.create.mockResolvedValue(mockStripeSubscription)
mockStripe.subscriptions.retrieve.mockResolvedValue(mockStripeSubscription)
mockStripe.checkout.sessions.create.mockResolvedValue(mockCheckoutSession)
