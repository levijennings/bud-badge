export interface Organization {
  id: string
  name: string
  slug: string
  license_number?: string
  state: string
  city: string
  plan: 'starter' | 'professional' | 'enterprise'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  employee_count: number
  max_employees: number
  created_at: string
}

export interface Employee {
  id: string
  org_id: string
  user_id: string
  email: string
  display_name: string
  role: 'owner' | 'manager' | 'budtender'
  hire_date: string
  certifications: Certification[]
  training_progress: number
  is_active: boolean
  created_at: string
}

export interface TrainingModule {
  id: string
  title: string
  description: string
  category: 'compliance' | 'product_knowledge' | 'customer_service' | 'safety'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  content_blocks: ContentBlock[]
  quiz_questions: QuizQuestion[]
  passing_score: number
  state_requirements: string[]
  created_at: string
}

export interface ContentBlock {
  id: string
  type: 'text' | 'video' | 'image' | 'interactive'
  content: string
  order: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

export interface Certification {
  id: string
  employee_id: string
  module_id: string
  score: number
  passed: boolean
  completed_at: string
  expires_at?: string
}

export interface ComplianceRecord {
  id: string
  org_id: string
  type: string
  status: 'compliant' | 'warning' | 'non_compliant'
  details: string
  checked_at: string
}
