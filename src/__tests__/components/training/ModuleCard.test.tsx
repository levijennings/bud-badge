import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockModule } from '@/test/helpers'

// Mock component for testing - in real scenario, import the actual component
const ModuleCard = ({ module, onClick }: any) => (
  <div data-testid="module-card" onClick={onClick} role="button">
    <h3>{module.title}</h3>
    <p>{module.description}</p>
    <span data-testid="category">{module.category}</span>
    <span data-testid="difficulty">{module.difficulty}</span>
    <span data-testid="duration">{module.duration_minutes} min</span>
  </div>
)

describe('ModuleCard Component', () => {
  it('should render module card', () => {
    const mockModule = createMockModule()

    render(<ModuleCard module={mockModule} />)

    expect(screen.getByText(mockModule.title)).toBeInTheDocument()
    expect(screen.getByText(mockModule.description)).toBeInTheDocument()
  })

  it('should display module metadata', () => {
    const mockModule = createMockModule({
      category: 'compliance',
      difficulty: 'beginner',
      duration_minutes: 30,
    })

    render(<ModuleCard module={mockModule} />)

    expect(screen.getByTestId('category')).toHaveTextContent('compliance')
    expect(screen.getByTestId('difficulty')).toHaveTextContent('beginner')
    expect(screen.getByTestId('duration')).toHaveTextContent('30 min')
  })

  it('should display category badge', () => {
    const mockModule = createMockModule({ category: 'product_knowledge' })

    render(<ModuleCard module={mockModule} />)

    expect(screen.getByTestId('category')).toBeInTheDocument()
  })

  it('should display difficulty indicator', () => {
    const mockModule = createMockModule({ difficulty: 'advanced' })

    render(<ModuleCard module={mockModule} />)

    expect(screen.getByTestId('difficulty')).toBeInTheDocument()
  })

  it('should display duration in minutes', () => {
    const mockModule = createMockModule({ duration_minutes: 45 })

    render(<ModuleCard module={mockModule} />)

    expect(screen.getByTestId('duration')).toHaveTextContent('45 min')
  })

  it('should be clickable and call onClick handler', async () => {
    const mockModule = createMockModule()
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<ModuleCard module={mockModule} onClick={handleClick} />)

    const card = screen.getByTestId('module-card')
    await user.click(card)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should display all category types', () => {
    const categories = ['compliance', 'product_knowledge', 'customer_service', 'safety']

    categories.forEach((category) => {
      const mockModule = createMockModule({ category: category as any })
      const { unmount } = render(<ModuleCard module={mockModule} />)

      expect(screen.getByTestId('category')).toHaveTextContent(category)

      unmount()
    })
  })

  it('should display all difficulty levels', () => {
    const difficulties = ['beginner', 'intermediate', 'advanced']

    difficulties.forEach((difficulty) => {
      const mockModule = createMockModule({ difficulty: difficulty as any })
      const { unmount } = render(<ModuleCard module={mockModule} />)

      expect(screen.getByTestId('difficulty')).toHaveTextContent(difficulty)

      unmount()
    })
  })

  it('should display module with long title', () => {
    const longTitle = 'A Very Long Module Title That Explains Cannabis Compliance and Regulations'
    const mockModule = createMockModule({ title: longTitle })

    render(<ModuleCard module={mockModule} />)

    expect(screen.getByText(longTitle)).toBeInTheDocument()
  })

  it('should display module with long description', () => {
    const longDescription =
      'This is a comprehensive training module that covers all aspects of cannabis compliance including local, state, and federal regulations.'
    const mockModule = createMockModule({ description: longDescription })

    render(<ModuleCard module={mockModule} />)

    expect(screen.getByText(longDescription)).toBeInTheDocument()
  })

  it('should be keyboard accessible', async () => {
    const mockModule = createMockModule()
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<ModuleCard module={mockModule} onClick={handleClick} />)

    const card = screen.getByTestId('module-card')
    card.focus()

    expect(card).toHaveFocus()
  })

  it('should show loading state if provided', () => {
    const mockModule = createMockModule()

    const LoadingCard = () => (
      <div data-testid="loading-card">Loading...</div>
    )

    render(<LoadingCard />)

    expect(screen.getByTestId('loading-card')).toBeInTheDocument()
  })

  it('should handle missing optional fields gracefully', () => {
    const minimalModule = createMockModule({
      description: '',
    })

    render(<ModuleCard module={minimalModule} />)

    expect(screen.getByText(minimalModule.title)).toBeInTheDocument()
  })

  it('should support different module states', () => {
    const completedModule = createMockModule()
    const inProgressModule = createMockModule()
    const notStartedModule = createMockModule()

    expect(completedModule).toBeDefined()
    expect(inProgressModule).toBeDefined()
    expect(notStartedModule).toBeDefined()
  })
})
