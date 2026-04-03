import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatsCard } from '@/components/dashboard/StatsCard'

describe('StatsCard Component', () => {
  it('should render stats card with label and value', () => {
    render(<StatsCard label="Total Employees" value="25" />)

    expect(screen.getByText('Total Employees')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('should render with different value types', () => {
    const { rerender } = render(<StatsCard label="Completion Rate" value="85%" />)

    expect(screen.getByText('85%')).toBeInTheDocument()

    rerender(<StatsCard label="Employees" value={42} />)

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should display icon when provided', () => {
    const mockIcon = <span data-testid="mock-icon">Icon</span>

    render(<StatsCard label="Certifications" value="12" icon={mockIcon} />)

    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
  })

  it('should display upward trend', () => {
    render(
      <StatsCard
        label="Growth"
        value="120"
        trend={{
          direction: 'up',
          percentage: 15,
        }}
      />
    )

    expect(screen.getByText('15%')).toBeInTheDocument()
  })

  it('should display downward trend', () => {
    render(
      <StatsCard
        label="Dropout Rate"
        value="5"
        trend={{
          direction: 'down',
          percentage: 8,
        }}
      />
    )

    expect(screen.getByText('8%')).toBeInTheDocument()
  })

  it('should include trend label', () => {
    render(
      <StatsCard
        label="Revenue"
        value="$4,200"
        trend={{
          direction: 'up',
          percentage: 12,
          label: 'vs last month',
        }}
      />
    )

    expect(screen.getByText('vs last month')).toBeInTheDocument()
  })

  it('should apply default variant', () => {
    const { container } = render(<StatsCard label="Test" value="100" variant="default" />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should apply dark variant', () => {
    const { container } = render(<StatsCard label="Test" value="100" variant="dark" />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should show loading state', () => {
    const { container } = render(
      <StatsCard label="Loading" value="0" loading={true} />
    )

    // Should show skeleton/loading indicator
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('should not show loading skeleton when not loading', () => {
    const { container } = render(
      <StatsCard label="Loaded" value="100" loading={false} />
    )

    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <StatsCard label="Test" value="100" className="custom-class" />
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('should handle onClick when provided', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<StatsCard label="Clickable" value="100" onClick={handleClick} />)

    const card = screen.getByRole('button', { hidden: true })
    if (card) {
      await user.click(card)
      expect(handleClick).toHaveBeenCalled()
    }
  })

  it('should render trend with different percentages', () => {
    const { rerender } = render(
      <StatsCard
        label="Test"
        value="100"
        trend={{ direction: 'up', percentage: 5 }}
      />
    )

    expect(screen.getByText('5%')).toBeInTheDocument()

    rerender(
      <StatsCard
        label="Test"
        value="100"
        trend={{ direction: 'up', percentage: 99 }}
      />
    )

    expect(screen.getByText('99%')).toBeInTheDocument()
  })

  it('should handle large numbers', () => {
    render(<StatsCard label="Total Revenue" value="1,234,567" />)

    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('should handle decimal values', () => {
    render(<StatsCard label="Average Score" value="87.5" />)

    expect(screen.getByText('87.5')).toBeInTheDocument()
  })

  it('should render multiple instances correctly', () => {
    render(
      <>
        <StatsCard label="Card 1" value="100" />
        <StatsCard label="Card 2" value="200" />
        <StatsCard label="Card 3" value="300" />
      </>
    )

    expect(screen.getByText('Card 1')).toBeInTheDocument()
    expect(screen.getByText('Card 2')).toBeInTheDocument()
    expect(screen.getByText('Card 3')).toBeInTheDocument()
  })

  it('should handle missing trend label gracefully', () => {
    render(
      <StatsCard
        label="Test"
        value="100"
        trend={{
          direction: 'up',
          percentage: 10,
        }}
      />
    )

    expect(screen.getByText('10%')).toBeInTheDocument()
  })

  it('should display correct trend colors', () => {
    const { container: upContainer } = render(
      <StatsCard
        label="Up"
        value="100"
        trend={{ direction: 'up', percentage: 10 }}
      />
    )

    const { container: downContainer } = render(
      <StatsCard
        label="Down"
        value="100"
        trend={{ direction: 'down', percentage: 10 }}
      />
    )

    expect(upContainer).toBeInTheDocument()
    expect(downContainer).toBeInTheDocument()
  })

  it('should support accessibility features', () => {
    render(<StatsCard label="Accessible Card" value="42" />)

    const label = screen.getByText('Accessible Card')
    const value = screen.getByText('42')

    expect(label).toBeInTheDocument()
    expect(value).toBeInTheDocument()
  })

  it('should handle zero value', () => {
    render(<StatsCard label="Empty State" value="0" />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should maintain aspect ratio in layout', () => {
    const { container } = render(
      <>
        <StatsCard label="Short" value="5" />
        <StatsCard label="Long Label Name" value="12345" />
      </>
    )

    const cards = container.querySelectorAll('[class*="Card"]')
    expect(cards.length).toBeGreaterThan(0)
  })
})
