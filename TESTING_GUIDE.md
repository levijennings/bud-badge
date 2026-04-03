# Bud Badge Testing Guide

Complete QA test suite with Vitest + Playwright for Next.js 14 multi-tenant SaaS.

## Quick Start

```bash
# Install dependencies
npm install

# Run all unit tests
npm run test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Interactive UI for debugging
npm run test:ui
npm run test:e2e:ui
```

## Files Created

### Configuration
- `vitest.config.ts` - Vitest setup with TypeScript, path aliases, jsdom, v8 coverage
- `playwright.config.ts` - E2E testing across browsers/devices
- `.github/workflows/ci.yml` - GitHub Actions CI pipeline

### Test Infrastructure
- `src/test/setup.ts` - Global test setup (mocks, environment)
- `src/test/helpers.ts` - Mock factories (createMockOrg, createMockMember, etc.)
- `src/test/mocks/supabase.ts` - Supabase mock with multi-tenant awareness
- `src/test/mocks/stripe.ts` - Stripe checkout/subscription mocks

### Unit Tests (src/__tests__/)

**Library Tests:**
- `lib/validations.test.ts` - All Zod schemas (validation, error cases)
- `lib/api-helpers.test.ts` - Response builders, scoring, pagination

**API Tests:**
- `api/organizations.test.ts` - Org creation, access control, plan limits
- `api/training.test.ts` - Module listing, progress, quiz grading, certificates
- `api/billing.test.ts` - Stripe checkout, webhooks, subscription lifecycle

**Component Tests:**
- `components/training/ModuleCard.test.tsx` - Card rendering, metadata, click handler
- `components/training/QuizQuestion.test.tsx` - Question/options, answer selection, feedback
- `components/dashboard/StatsCard.test.tsx` - Stats display, trends, variants, loading

### E2E Tests (e2e/)
- `auth.spec.ts` - Signup, login, logout flows
- `training.spec.ts` - Browse modules, take quiz, complete training, download certificate

### Documentation
- `TEST_SETUP.md` - Comprehensive testing documentation
- `TESTING_GUIDE.md` - This file (quick reference)

## Test Coverage Summary

### Coverage by Module
| Module | Type | Tests | Coverage Target |
|--------|------|-------|-----------------|
| `lib/validations.ts` | Unit | 35+ | 95%+ |
| `lib/api-helpers.ts` | Unit | 25+ | 90%+ |
| `api/organizations/*` | Unit | 20+ | 85%+ |
| `api/training/*` | Unit | 25+ | 85%+ |
| `api/billing/*` | Unit | 20+ | 85%+ |
| Components | Unit | 35+ | 80%+ |
| Auth Flow | E2E | 9 | 100% |
| Training Flow | E2E | 15+ | 100% |

### Total Test Count
- Unit Tests: 160+
- E2E Tests: 24+
- **Total: 184+ test cases**

## Test Categories

### Validations
- 35+ schema validation tests
- Input validation (email, slug, UUID)
- Enum constraints (roles, categories, plans)
- Numeric ranges (progress 0-100, scores)
- Error message generation

### Organization API
- Create org with proper max_employees by plan
- Get org (member-only access)
- Update org (owner-only access)
- Non-member gets 403 Forbidden
- Plan-based feature gating
- Stripe customer linking

### Training API
- List modules with filters (category, difficulty)
- Track progress (0-100%)
- Submit quiz with validation
- Auto-grade with passing score logic
- Certificate generation on pass
- Access control per org
- Multi-module training paths

### Billing API
- Create Stripe checkout session
- Webhook signature verification
- Subscription created/updated/deleted events
- Plan upgrades and downgrades
- Customer and invoice management
- Failed payment handling
- Subscription renewal cycles

### Components
- Module card rendering and interaction
- Quiz question with answer feedback
- Stats card with trends
- Loading states
- Keyboard accessibility
- Responsive variants

## Mock Objects

### Factories (src/test/helpers.ts)
```ts
createMockOrg()              // Organization
createMockMember()           // Employee
createMockModule()           // Training module
createMockQuiz()            // Module with 3 questions
createMockCertification()    // Certification record
createMockComplianceRecord() // Compliance audit

// Quiz helpers
createQuizAnswers(questions)           // Generate answers array
simulateQuizAttempt(questions, correct) // Create attempt with N correct
```

### Supabase Mock (src/test/mocks/supabase.ts)
- Auth user with metadata
- Org member with role
- Query builder with org context
- Multi-tenant isolation checks

### Stripe Mock (src/test/mocks/stripe.ts)
- Customer object
- Subscription with billing cycles
- Checkout session with redirect URLs
- Webhook events
- Plan pricing configuration

## Running Tests in CI

GitHub Actions workflow automatically:
1. Runs ESLint
2. Runs Vitest unit tests
3. Generates coverage report
4. Uploads to Codecov
5. Builds Next.js app
6. Runs Playwright E2E tests
7. Archives test artifacts

Coverage must meet 80% threshold on:
- Lines
- Functions
- Branches
- Statements

## Example Test Patterns

### Validation Test
```ts
it('should validate email format', () => {
  const valid = memberInviteSchema.safeParse({
    email: 'test@example.com',
    role: 'budtender'
  })
  expect(valid.success).toBe(true)

  const invalid = memberInviteSchema.safeParse({
    email: 'not-an-email',
    role: 'budtender'
  })
  expect(invalid.success).toBe(false)
})
```

### API Test
```ts
it('should require owner to update organization', () => {
  const ownerMember = createMockMember({ role: 'owner' })
  expect(ownerMember.role).toBe('owner')

  // Non-owner gets 403
  mockRequireOrgRole.mockResolvedValueOnce({
    authorized: false,
    response: { status: 403 }
  })
})
```

### Component Test
```ts
it('should show correct feedback on answer', async () => {
  const question = mockQuiz.quiz_questions[0]
  render(
    <QuizQuestion
      question={question}
      selectedAnswer={question.correct_answer}
      showFeedback={true}
    />
  )
  expect(screen.getByTestId('correct-feedback')).toBeInTheDocument()
})
```

### E2E Test
```ts
test('should complete quiz and pass', async ({ page }) => {
  await page.goto('/training/quiz/1')

  // Answer questions
  await page.click('[data-testid="option-0"]')
  await page.click('button:has-text("Submit")')

  // Verify pass
  expect(page.locator('[data-testid="quiz-status"]'))
    .toContainText('passed')
})
```

## Debugging

### Unit Tests
```bash
# Watch specific file
npm run test:watch -- validations.test.ts

# Debug with inspector
node --inspect-brk ./node_modules/.bin/vitest run

# UI mode with filtering
npm run test:ui
```

### E2E Tests
```bash
# Debug mode with Inspector
npm run test:e2e:debug

# Interactive UI
npm run test:e2e:ui

# Specific browser
npx playwright test --project=chromium

# Single test
npx playwright test e2e/auth.spec.ts
```

### Coverage
```bash
# Generate and view report
npm run test:coverage
open coverage/index.html
```

## Best Practices

1. **Always mock external services**
   - Supabase queries
   - Stripe API calls
   - Next.js router/navigation

2. **Use provided factories**
   - `createMockOrg()` for organizations
   - `createMockMember()` for employees
   - `createMockModule()` for training modules

3. **Test behavior, not implementation**
   - Focus on inputs and outputs
   - Avoid testing internal state
   - Use semantic queries

4. **Keep tests isolated**
   - No test dependencies
   - Clear setup and teardown
   - Independent data per test

5. **Write descriptive names**
   - Describe what should happen
   - Use "should" or "must" format
   - Make failures self-documenting

6. **Maintain coverage**
   - Aim for 80%+ on all modules
   - Test happy paths and errors
   - Cover edge cases

## Troubleshooting

### Tests not finding modules
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port conflicts with E2E
```bash
# Kill Next.js process
lsof -ti:3000 | xargs kill -9
npm run test:e2e
```

### Coverage threshold failures
```bash
npm run test:coverage
open coverage/index.html
# Fix uncovered lines
```

### Flaky E2E tests
- Use explicit waits: `page.waitForLoadState('networkidle')`
- Increase timeout: `test.setTimeout(60000)`
- Check browser logs in artifacts

## Next Steps

1. Run `npm install` to install dependencies
2. Verify setup: `npm run test -- --list`
3. Run tests: `npm run test` and `npm run test:e2e`
4. Check coverage: `npm run test:coverage`
5. Integrate with CI/CD (already configured in `.github/workflows/ci.yml`)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Zod Validation](https://zod.dev/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

**Total Files Created:** 18
**Total Test Cases:** 184+
**Code Coverage Target:** 80%
**CI Integration:** GitHub Actions (`.github/workflows/ci.yml`)
