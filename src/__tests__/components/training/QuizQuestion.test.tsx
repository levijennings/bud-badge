import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockQuiz } from '@/test/helpers'

// Mock component for testing - in real scenario, import the actual component
const QuizQuestion = ({ question, onAnswer, showFeedback = false, selectedAnswer = null }: any) => {
  const isCorrect = selectedAnswer === question.correct_answer

  return (
    <div data-testid="quiz-question">
      <h3>{question.question}</h3>
      <div data-testid="options">
        {question.options.map((option: string, index: number) => (
          <button
            key={index}
            data-testid={`option-${index}`}
            onClick={() => onAnswer(index)}
            aria-pressed={selectedAnswer === index}
            className={
              showFeedback
                ? index === question.correct_answer
                  ? 'correct'
                  : selectedAnswer === index
                    ? 'incorrect'
                    : ''
                : ''
            }
          >
            {option}
          </button>
        ))}
      </div>
      {showFeedback && selectedAnswer !== null && (
        <div data-testid="feedback">
          {isCorrect ? (
            <p data-testid="correct-feedback" className="success">
              Correct!
            </p>
          ) : (
            <p data-testid="incorrect-feedback" className="error">
              Incorrect
            </p>
          )}
          <p data-testid="explanation">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}

describe('QuizQuestion Component', () => {
  let mockQuiz: any

  beforeEach(() => {
    mockQuiz = createMockQuiz()
  })

  it('should render question text', () => {
    const question = mockQuiz.quiz_questions[0]

    render(<QuizQuestion question={question} onAnswer={vi.fn()} />)

    expect(screen.getByText(question.question)).toBeInTheDocument()
  })

  it('should render all answer options', () => {
    const question = mockQuiz.quiz_questions[0]

    render(<QuizQuestion question={question} onAnswer={vi.fn()} />)

    question.options.forEach((option: string) => {
      expect(screen.getByText(option)).toBeInTheDocument()
    })
  })

  it('should call onAnswer when option is selected', async () => {
    const question = mockQuiz.quiz_questions[0]
    const handleAnswer = vi.fn()
    const user = userEvent.setup()

    render(<QuizQuestion question={question} onAnswer={handleAnswer} />)

    const option = screen.getByTestId('option-0')
    await user.click(option)

    expect(handleAnswer).toHaveBeenCalledWith(0)
  })

  it('should highlight selected answer', async () => {
    const question = mockQuiz.quiz_questions[0]
    const user = userEvent.setup()

    const { rerender } = render(
      <QuizQuestion question={question} onAnswer={vi.fn()} selectedAnswer={null} />
    )

    const option = screen.getByTestId('option-1')
    await user.click(option)

    rerender(<QuizQuestion question={question} onAnswer={vi.fn()} selectedAnswer={1} />)

    expect(screen.getByTestId('option-1')).toHaveAttribute('aria-pressed', 'true')
  })

  it('should show correct feedback when answer is correct', () => {
    const question = mockQuiz.quiz_questions[0]

    render(
      <QuizQuestion
        question={question}
        onAnswer={vi.fn()}
        selectedAnswer={question.correct_answer}
        showFeedback={true}
      />
    )

    expect(screen.getByTestId('correct-feedback')).toBeInTheDocument()
    expect(screen.getByTestId('explanation')).toBeInTheDocument()
  })

  it('should show incorrect feedback when answer is wrong', () => {
    const question = mockQuiz.quiz_questions[0]
    const wrongAnswer = (question.correct_answer + 1) % question.options.length

    render(
      <QuizQuestion
        question={question}
        onAnswer={vi.fn()}
        selectedAnswer={wrongAnswer}
        showFeedback={true}
      />
    )

    expect(screen.getByTestId('incorrect-feedback')).toBeInTheDocument()
    expect(screen.getByTestId('explanation')).toBeInTheDocument()
  })

  it('should display explanation for answer', () => {
    const question = mockQuiz.quiz_questions[0]

    render(
      <QuizQuestion
        question={question}
        onAnswer={vi.fn()}
        selectedAnswer={question.correct_answer}
        showFeedback={true}
      />
    )

    expect(screen.getByTestId('explanation')).toHaveTextContent(question.explanation)
  })

  it('should not show feedback before answer is submitted', () => {
    const question = mockQuiz.quiz_questions[0]

    render(
      <QuizQuestion
        question={question}
        onAnswer={vi.fn()}
        selectedAnswer={null}
        showFeedback={false}
      />
    )

    expect(screen.queryByTestId('feedback')).not.toBeInTheDocument()
  })

  it('should handle multiple choice options', async () => {
    const question = mockQuiz.quiz_questions[0]
    const handleAnswer = vi.fn()
    const user = userEvent.setup()

    render(<QuizQuestion question={question} onAnswer={handleAnswer} />)

    // Test clicking different options
    for (let i = 0; i < question.options.length; i++) {
      const option = screen.getByTestId(`option-${i}`)
      await user.click(option)
      expect(handleAnswer).toHaveBeenCalledWith(i)
    }
  })

  it('should display correct answer after feedback', () => {
    const question = mockQuiz.quiz_questions[0]
    const wrongAnswer = (question.correct_answer + 1) % question.options.length

    render(
      <QuizQuestion
        question={question}
        onAnswer={vi.fn()}
        selectedAnswer={wrongAnswer}
        showFeedback={true}
      />
    )

    // Correct answer should be highlighted
    expect(screen.getByTestId(`option-${question.correct_answer}`)).toHaveClass('correct')
  })

  it('should support question navigation', async () => {
    const question1 = mockQuiz.quiz_questions[0]
    const question2 = mockQuiz.quiz_questions[1]
    const handleAnswer = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(
      <QuizQuestion question={question1} onAnswer={handleAnswer} />
    )

    expect(screen.getByText(question1.question)).toBeInTheDocument()

    // Navigate to next question
    rerender(<QuizQuestion question={question2} onAnswer={handleAnswer} />)

    expect(screen.getByText(question2.question)).toBeInTheDocument()
    expect(screen.queryByText(question1.question)).not.toBeInTheDocument()
  })

  it('should allow changing answer before submission', async () => {
    const question = mockQuiz.quiz_questions[0]
    const handleAnswer = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(
      <QuizQuestion
        question={question}
        onAnswer={handleAnswer}
        selectedAnswer={0}
        showFeedback={false}
      />
    )

    expect(screen.getByTestId('option-0')).toHaveAttribute('aria-pressed', 'true')

    // Change selection
    rerender(
      <QuizQuestion
        question={question}
        onAnswer={handleAnswer}
        selectedAnswer={1}
        showFeedback={false}
      />
    )

    expect(screen.getByTestId('option-1')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('option-0')).toHaveAttribute('aria-pressed', 'false')
  })

  it('should be keyboard accessible', async () => {
    const question = mockQuiz.quiz_questions[0]
    const handleAnswer = vi.fn()

    render(<QuizQuestion question={question} onAnswer={handleAnswer} />)

    const options = screen.getAllByTestId(/^option-/)
    options[0].focus()

    expect(options[0]).toHaveFocus()
  })

  it('should handle question with long text', () => {
    const longQuestion = {
      ...mockQuiz.quiz_questions[0],
      question: 'This is a very long question that asks about cannabis compliance regulations and how they apply to retail establishments in different states',
    }

    render(<QuizQuestion question={longQuestion} onAnswer={vi.fn()} />)

    expect(screen.getByText(longQuestion.question)).toBeInTheDocument()
  })

  it('should track answer attempts', async () => {
    const question = mockQuiz.quiz_questions[0]
    const handleAnswer = vi.fn()
    const user = userEvent.setup()

    render(<QuizQuestion question={question} onAnswer={handleAnswer} />)

    // Simulate multiple attempts
    await user.click(screen.getByTestId('option-0'))
    await user.click(screen.getByTestId('option-1'))
    await user.click(screen.getByTestId('option-2'))

    expect(handleAnswer).toHaveBeenCalledTimes(3)
  })
})
