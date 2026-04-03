import { vi } from 'vitest'

export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn(),
}

export const mockSupabaseQuery = {
  select: vi.fn(function (this: any) {
    return this
  }),
  eq: vi.fn(function (this: any) {
    return this
  }),
  single: vi.fn(function (this: any) {
    return { data: null, error: null }
  }),
  insert: vi.fn(function (this: any) {
    return this
  }),
  update: vi.fn(function (this: any) {
    return this
  }),
  delete: vi.fn(function (this: any) {
    return this
  }),
  order: vi.fn(function (this: any) {
    return this
  }),
  limit: vi.fn(function (this: any) {
    return this
  }),
  range: vi.fn(function (this: any) {
    return this
  }),
  count: vi.fn(function (this: any) {
    return this
  }),
}

export function createMockSupabaseClient() {
  const client = {
    ...mockSupabaseClient,
    from: vi.fn((table: string) => ({
      ...mockSupabaseQuery,
    })),
  }
  return client
}

// Mock auth user
export function createMockAuthUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    email_confirmed_at: new Date().toISOString(),
    phone: null,
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

// Mock org member context
export function createMockOrgMember(overrides = {}) {
  return {
    id: 'member-123',
    org_id: 'org-123',
    user_id: 'user-123',
    role: 'manager' as const,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

// Create org-aware query builder with context
export function createOrgAwareQueryBuilder(orgId: string, userId: string) {
  return {
    select: vi.fn(function (this: any) {
      return this
    }),
    eq: vi.fn(function (this: any, column: string, value: any) {
      // Check org context
      if (column === 'org_id' && value !== orgId) {
        return {
          ...this,
          single: vi.fn().mockResolvedValueOnce({ data: null, error: { code: 'FORBIDDEN' } }),
        }
      }
      return this
    }),
    single: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
    insert: vi.fn(function (this: any) {
      return this
    }),
    update: vi.fn(function (this: any) {
      return this
    }),
    delete: vi.fn(function (this: any) {
      return this
    }),
  }
}
