import { Organization, Employee, TrainingModule, QuizQuestion, Certification, ComplianceRecord } from '@/types'

export function createMockOrg(overrides: Partial<Organization> = {}): Organization {
  return {
    id: 'org-123',
    name: 'Test Organization',
    slug: 'test-org',
    license_number: 'LIC-123456',
    state: 'CO',
    city: 'Denver',
    plan: 'professional',
    stripe_customer_id: 'cus_test123',
    stripe_subscription_id: 'sub_test123',
    employee_count: 5,
    max_employees: 50,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockMember(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 'emp-123',
    org_id: 'org-123',
    user_id: 'user-123',
    email: 'employee@example.com',
    display_name: 'John Doe',
    role: 'budtender',
    hire_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    certifications: [],
    training_progress: 45,
    is_active: true,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockModule(overrides: Partial<TrainingModule> = {}): TrainingModule {
  return {
    id: 'module-123',
    title: 'Cannabis Compliance Basics',
    description: 'Learn the fundamentals of cannabis compliance and regulations',
    category: 'compliance',
    difficulty: 'beginner',
    duration_minutes: 30,
    content_blocks: [
      {
        id: 'cb-1',
        type: 'text',
        content: 'Introduction to cannabis compliance',
        order: 1,
      },
      {
        id: 'cb-2',
        type: 'video',
        content: 'https://example.com/video1',
        order: 2,
      },
    ],
    quiz_questions: [
      {
        id: 'q-1',
        question: 'What is the legal age for cannabis use?',
        options: ['18', '21', '16', '25'],
        correct_answer: 1,
        explanation: 'The legal age is 21 in most states',
      },
    ],
    passing_score: 70,
    state_requirements: ['CO', 'WA'],
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockQuiz(overrides: Partial<TrainingModule> = {}) {
  const module = createMockModule(overrides)
  return {
    ...module,
    quiz_questions: [
      {
        id: 'q-1',
        question: 'What is the legal THC limit in edibles?',
        options: ['5mg', '10mg', '20mg', '50mg'],
        correct_answer: 1,
        explanation: 'Federal edibles are limited to 10mg THC',
      },
      {
        id: 'q-2',
        question: 'What are the three pillars of compliance?',
        options: [
          'Recording, Tracking, Reporting',
          'Inventory, Quality, Safety',
          'Marketing, Sales, Distribution',
          'Staff, Customers, Management',
        ],
        correct_answer: 0,
        explanation: 'Recording, Tracking, and Reporting are fundamental to compliance',
      },
      {
        id: 'q-3',
        question: 'How often should compliance audits be conducted?',
        options: ['Monthly', 'Quarterly', 'Annually', 'Every 2 years'],
        correct_answer: 2,
        explanation: 'Annual audits are standard industry practice',
      },
    ],
  }
}

export function createMockCertification(overrides: Partial<Certification> = {}): Certification {
  return {
    id: 'cert-123',
    employee_id: 'emp-123',
    module_id: 'module-123',
    score: 85,
    passed: true,
    completed_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  }
}

export function createMockComplianceRecord(overrides: Partial<ComplianceRecord> = {}): ComplianceRecord {
  return {
    id: 'comp-123',
    org_id: 'org-123',
    type: 'inventory_audit',
    status: 'compliant',
    details: 'All inventory accounted for and properly labeled',
    checked_at: new Date().toISOString(),
    ...overrides,
  }
}

// Helper to create quiz answers
export function createQuizAnswers(
  questions: QuizQuestion[],
  overrides: Record<string, number> = {}
) {
  return questions.map((q) => ({
    question_id: q.id,
    selected_answer: overrides[q.id] !== undefined ? overrides[q.id] : q.correct_answer,
  }))
}

// Helper to simulate quiz attempt
export function simulateQuizAttempt(
  questions: QuizQuestion[],
  correctAnswerCount: number
) {
  const answers: Array<{ question_id: string; selected_answer: number }> = []

  for (let i = 0; i < questions.length; i++) {
    if (i < correctAnswerCount) {
      // Answer correctly
      answers.push({
        question_id: questions[i].id,
        selected_answer: questions[i].correct_answer,
      })
    } else {
      // Answer incorrectly
      const wrongAnswer = (questions[i].correct_answer + 1) % questions[i].options.length
      answers.push({
        question_id: questions[i].id,
        selected_answer: wrongAnswer,
      })
    }
  }

  return answers
}
