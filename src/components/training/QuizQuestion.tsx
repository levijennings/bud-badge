import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: QuizOption[];
  onSelectAnswer: (optionId: string) => void;
  onSubmit?: () => void;
  selectedAnswerId?: string;
  submittedAnswerId?: string;
  correctAnswerId?: string;
  disabled?: boolean;
  showFeedback?: boolean;
  feedback?: string;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  questionNumber,
  totalQuestions,
  question,
  options,
  onSelectAnswer,
  onSubmit,
  selectedAnswerId,
  submittedAnswerId,
  correctAnswerId,
  disabled = false,
  showFeedback = false,
  feedback,
}) => {
  const isSubmitted = !!submittedAnswerId;
  const isCorrect = isSubmitted && submittedAnswerId === correctAnswerId;

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">
            Question {questionNumber} of {totalQuestions}
          </p>
          <p className="text-sm font-medium text-gray-600">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </p>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {question}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {options.map((option) => {
          const isSelected = selectedAnswerId === option.id;
          const isSubmittedOption = submittedAnswerId === option.id;
          const isCorrectOption = correctAnswerId === option.id;
          const showAsCorrect = isSubmitted && isCorrectOption;
          const showAsIncorrect = isSubmitted && isSubmittedOption && !isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => !disabled && !isSubmitted && onSelectAnswer(option.id)}
              disabled={disabled || isSubmitted}
              className={`
                w-full p-4 text-left rounded-lg border-2 font-medium
                transition-all duration-200 flex items-center justify-between
                ${showAsCorrect
                  ? 'border-green-500 bg-green-50 text-green-900'
                  : showAsIncorrect
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 text-gray-900 hover:border-gray-300'
                }
                ${disabled || isSubmitted ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <span>{option.text}</span>

              {isSubmitted && (
                <>
                  {showAsCorrect && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  {showAsIncorrect && (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && isSubmitted && feedback && (
        <div
          className={`
            p-4 rounded-lg mb-6 text-sm
            ${isCorrect
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
            }
          `}
        >
          {feedback}
        </div>
      )}

      {/* Action Button */}
      {!isSubmitted && onSubmit && (
        <button
          onClick={onSubmit}
          disabled={!selectedAnswerId || disabled}
          className={`
            w-full px-6 py-3 rounded-lg font-medium transition-colors
            ${selectedAnswerId && !disabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-600 cursor-not-allowed'
            }
          `}
        >
          {questionNumber === totalQuestions ? 'Submit Quiz' : 'Next Question'}
        </button>
      )}
    </div>
  );
};

QuizQuestion.displayName = 'QuizQuestion';
