/**
 * Shared type definitions for Bud Badge component library
 */

/**
 * User roles in the system
 */
export type UserRole = 'owner' | 'manager' | 'budtender';

/**
 * Training status
 */
export type TrainingStatus = 'not-started' | 'in-progress' | 'complete';

/**
 * Compliance status
 */
export type ComplianceStatus = 'compliant' | 'warning' | 'non-compliant';

/**
 * Module difficulty level
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Toast variant
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Badge variant
 */
export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'owner'
  | 'manager'
  | 'budtender';

/**
 * Button variant
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/**
 * Button size
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Component size
 */
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Card variant
 */
export type CardVariant = 'default' | 'dark';

/**
 * Progress bar status
 */
export type ProgressStatus = 'in-progress' | 'complete' | 'pending';

/**
 * Modal size
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Input variant
 */
export type InputVariant = 'default' | 'search' | 'password';

/**
 * User information
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  role: UserRole;
  organizationId?: string;
}

/**
 * Organization information
 */
export interface Organization {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Training module
 */
export interface TrainingModule {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: DifficultyLevel;
  duration: number; // in minutes
  progress?: number; // 0-100
  started?: boolean;
  completed?: boolean;
  isPremium?: boolean;
  hasAccess?: boolean;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Quiz question
 */
export interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correctOptionId: string;
  feedback?: string;
  moduleId?: string;
}

/**
 * Certificate
 */
export interface Certificate {
  id: string;
  userId: string;
  moduleId: string;
  moduleName: string;
  score: number;
  dateEarned: Date;
  expiryDate?: Date;
  certificateNumber: string;
  isExpired?: boolean;
}

/**
 * Compliance requirement
 */
export interface ComplianceRequirement {
  id: string;
  name: string;
  description?: string;
  status: ComplianceStatus;
  daysUntilExpiry?: number;
  dueDate?: Date;
}

/**
 * Action item
 */
export interface ActionItem {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

/**
 * Stats data
 */
export interface StatsData {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
    label?: string;
  };
}

/**
 * Table action
 */
export interface TableAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  icon?: React.ReactNode;
}

/**
 * Navigation link
 */
export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

/**
 * Sidebar section
 */
export interface SidebarSection {
  title?: string;
  links: NavLink[];
}

/**
 * Form field error
 */
export interface FormError {
  field: string;
  message: string;
}

/**
 * API response
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: FormError[];
}

/**
 * Pagination
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}
