# Bud Badge Test Suite Setup

Complete QA test suite for Bud Badge - a Next.js 14 multi-tenant SaaS with Supabase and Stripe.

## Installation

```bash
cd /sessions/optimistic-sweet-carson/bud-badge
npm install
```

All test dependencies are already configured in `package.json`.

## Test Infrastructure

### Vitest (Unit & Integration Tests)

**Configuration**: `vitest.config.ts`

- TypeScript support with path aliases (`@/*`)
- jsdom environment for component testing
- v8 coverage provider with 80% threshold
- Setup file: `src/test/setup.ts`

**Features:**
- Global test utilities configured
- Next.js router/navigation mocked
- Environment variables preset
- Fetch mocked globally

### Playwright (E2E Tests)

**Configuration**: `playwright.config.ts`

- Multi-browser testing (Chromium, Firefox, WebKit)
- Mobile testing (iOS, Android)
- Screenshots and videos on failure
- HTML reporter with trace viewer
- Local dev server auto-start

## Available Commands

```bash
# Unit Tests
npm run test                 # Run once
npm run test:watch         # Watch mode
npm run test:ui           # UI dashboard
npm run test:coverage     # With coverage report

# E2E Tests
npm run test:e2e          # Headless
npm run test:e2e:ui       # Interactive UI
npm run test:e2e:debug    # Debug mode

# CI/CD
npm run lint              # ESLint
npm run build             # Build next.js app
```

## Project Structure

```
bud-badge/
├── vitest.config.ts                      # Vitest configuration
├── playwright.config.ts                  # Playwright configuration
├── src/
│   ├── test/
│   │   ├── setup.ts                     # Global test setup
│   │   ├── helpers.ts                   # Mock factories & utilities
│   │   └── mocks/
│   │       ├── supabase.ts              # Supabase mocks
│   │       └── stripe.ts                # Stripe mocks
│   │
│   ├── __tests__/
│   │   ├── lib/
│   │   │   ├── validations.test.ts      # Zod schema validation tests
│   │   │   └── api-helpers.test.ts      # API helper function tests
│   │   │
│   │   ├── api/
│   │   │   ├── organizations.test.ts    # Organization API tests
│   │   │   ├── training.test.ts         # Training API tests
│   │   │   └── billing.test.ts          # Billing & Stripe tests
│   │   │
│   │   └── components/
│   │       ├── training/
│   │       │   ├── ModuleCard.test.tsx
│   │       │   └── QuizQuestion.test.tsx
│   │       └── dashboard/
│   │           └── StatsCard.test.tsx
│   │
│   ├── app/
│   │   └── api/                         # API routes to test
│   │
│   ├── components/                      # Components to test
│   ├── lib/
│   │   ├── validations.ts              # Zod schemas
│   │   ├── api-helpers.ts              # API utilities
│   │   └── stripe.ts                   # Stripe configuration
│   └── types/
│       └── index.ts                    # TypeScript types
│
├── e2e/
│   ├── auth.spec.ts                    # Authentication E2E
│   └── training.spec.ts                # Training flow E2E
│
└── .github/
    └── workflows/
        └── ci.yml                      # GitHub Actions pipeline
```

## Test Coverage

### Unit Tests (80% threshold)

#### Library Functions
- **validations.test.ts** - All Zod schemas
  - Organization creation/update validation
  - Member role validation
  - Training progress validation
  - Quiz attempt validation
  - Billing schema validation
  - Pagination parsing

- **api-helpers.test.ts** - API utilities
  - Response creation (success/error)
  - HTTP status codes
  - Module scoring calculation
  - Pagination parsing and limits

#### API Routes
- **organizations.test.ts**
  - Create organization with validation
  - Get user's organization
  - Update organization (owner only)
  - Member access control (403 for non-members)
  - Plan-based employee limits
  - Stripe customer linking

- **training.test.ts**
  - List modules with filters (category, difficulty)
  - Track progress (0-100%)
  - Submit quiz and auto-grade
  - Calculate pass/fail (based on passing_score)
  - Generate certificates on pass
  - Module access control

- **billing.test.ts**
  - Create Stripe checkout session
  - Webhook signature verification
  - Subscription lifecycle (create, update, cancel)
  - Plan upgrades/downgrades
  - Customer and invoice management
  - Failed payment handling
  - Payment retry links

#### Components
- **ModuleCard.test.tsx**
  - Renders title, description, metadata
  - Category and difficulty badges
  - Duration display
  - Click handler
  - Keyboard accessible
  - Loading state

- **QuizQuestion.test.tsx**
  - Question and options render
  - Option selection tracking
  - Correct/incorrect feedback
  - Explanation display
  - Multiple attempts
  - Question navigation
  - Keyboard accessibility

- **StatsCard.test.tsx**
  - Value and label display
  - Trend indicators (up/down)
  - Icon rendering
  - Loading state
  - Click handlers
  - Multiple variants (default/dark)
  - Accessibility features

### E2E Tests

#### Authentication Flow (e2e/auth.spec.ts)
- [ ] Signup with validation
- [ ] Login with credentials
- [ ] Logout and session clearing
- [ ] Invalid credentials error handling
- [ ] Email format validation
- [ ] Password confirmation
- [ ] Session persistence
- [ ] Session timeout
- [ ] Protected route redirects

#### Training Flow (e2e/training.spec.ts)
- [ ] List modules with filters
- [ ] Open module detail
- [ ] Display module content
- [ ] Start training
- [ ] Navigate content blocks
- [ ] Access quiz
- [ ] Answer questions
- [ ] Submit quiz
- [ ] View score (pass/fail)
- [ ] Generate certificate
- [ ] Download certificate
- [ ] Completion summary
- [ ] Compliance status tracking

## Mock Objects

### Supabase Mock (`src/test/mocks/supabase.ts`)
- Mock auth user with ID, email, metadata
- Mock org member with role and permissions
- Mock query builder with org context awareness
- Multi-tenant isolation enforcement

### Stripe Mock (`src/test/mocks/stripe.ts`)
- Mock customer object
- Mock subscription with billing cycles
- Mock checkout session with URLs
- Mock webhook events (subscription lifecycle)
- Plan pricing configuration

### Test Helpers (`src/test/helpers.ts`)

**Factory Functions:**
```ts
createMockOrg(overrides)                    // Organization entity
createMockMember(overrides)                 // Employee entity
createMockModule(overrides)                 // Training module
createMockQuiz(overrides)                   // Module with questions
createMockCertification(overrides)          // Certification record
createMockComplianceRecord(overrides)       // Compliance audit
```

**Utilities:**
```ts
createQuizAnswers(questions, overrides)     // Generate answer array
simulateQuizAttempt(questions, correctCount) // Create attempt with N correct
```

## Example Tests

### Validation Test
```ts
it('should validate slug format', () => {
  const data = { slug: 'valid-slug-123' }
  expect(orgCreateSchema.safeParse(data).success).toBe(true)

  const invalid = { slug: 'INVALID_SLUG' }
  expect(orgCreateSchema.safeParse(invalid).success).toBe(false)
})
```

### API Test
```ts
it('should require owner to update organization', () => {
  const ownerMember = createMockMember({ role: 'owner' })
  expect(ownerMember.role).toBe('owner')

  const managerMember = createMockMember({ role: 'manager' })
  expect(managerMember.role).not.toBe('owner')
})
```

### Component Test
```ts
it('should show correct feedback on quiz answer', () => {
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

  // Answer all questions correctly
  const options = page.locator('[data-testid="option-0"]')
  await options.click()

  // Submit
  await page.click('button:has-text("Submit")')

  // Verify pass
  expect(page.locator('[data-testid="quiz-status"]'))
    .toContainText('passed')
})
```

## Coverage Goals

### By Module
- `lib/validations.ts` - 95%+
- `lib/api-helpers.ts` - 90%+
- `app/api/organizations/route.ts` - 85%+
- `app/api/training/*.ts` - 85%+
- `app/api/billing/*.ts` - 85%+
- Components - 80%+

### By Type
- Auth flow - 100%
- Validation - 100%
- Business logic - 90%+
- Error handling - 95%+
- UI components - 80%+

## Running Tests in CI

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

1. **Lint** - ESLint for code quality
2. **Unit Tests** - Vitest with coverage
3. **Build** - Next.js build verification
4. **E2E Tests** - Playwright across browsers
5. **Coverage Upload** - Codecov integration

Coverage reports:
- HTML report: `coverage/index.html`
- LCOV format: `coverage/lcov.info`
- Codecov dashboard integration

## Debugging Tests

### Unit Tests
```bash
# Watch mode with file filter
npm run test:watch validations

# Debug single test
node --inspect-brk node_modules/.bin/vitest run src/__tests__/lib/validations.test.ts

# UI mode
npm run test:ui
```

### E2E Tests
```bash
# Debug mode with inspector
npm run test:e2e:debug

# UI mode
npm run test:e2e:ui

# Specific browser
npx playwright test --project=chromium

# Single test file
npx playwright test e2e/auth.spec.ts
```

## Best Practices

1. **Mocks First** - Use provided mocks from `src/test/mocks/`
2. **Factories Over Fixtures** - Use `createMock*` helpers
3. **Test Names** - Describe expected behavior clearly
4. **Assertions** - Keep them specific and isolated
5. **No Real APIs** - All Supabase/Stripe calls must be mocked
6. **Accessibility** - Use `getByRole`, `getByLabelText` when possible
7. **Async Handling** - Use `waitFor` for async operations
8. **Cleanup** - Tests auto-cleanup with Vitest

## Troubleshooting

### Tests failing due to missing modules
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port conflicts with E2E tests
```bash
# Kill existing Next.js process
lsof -ti:3000 | xargs kill -9
npm run test:e2e
```

### Coverage threshold not met
```bash
# Check coverage report
npm run test:coverage
open coverage/index.html
```

### Flaky E2E tests
- Use explicit waits: `page.waitForLoadState('networkidle')`
- Increase timeout: `test.setTimeout(60000)`
- Check browser compatibility in CI logs

## Next Steps

1. Run `npm install` to install all dependencies
2. Run `npm run test` to verify unit tests pass
3. Run `npm run test:e2e` to run end-to-end tests
4. Run `npm run test:coverage` to see coverage report
5. Integrate with CI/CD pipeline using `.github/workflows/ci.yml`

## Resources

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Zod Validation](https://zod.dev/)
