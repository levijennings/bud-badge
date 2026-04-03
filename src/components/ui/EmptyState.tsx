import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center py-12 px-4 text-center
        ${className || ''}
      `}
    >
      <div className="mb-4 inline-flex p-3 bg-gray-100 rounded-lg">
        <Icon className="w-8 h-8 text-gray-600" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-gray-600 text-sm max-w-sm mb-6">
        {description}
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        {action && (
          <button
            onClick={action.onClick}
            className={`
              px-4 py-2 rounded-md font-medium text-sm transition-colors
              ${action.variant === 'secondary'
                ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                : 'bg-green-600 text-white hover:bg-green-700'
              }
            `}
          >
            {action.label}
          </button>
        )}

        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-4 py-2 border border-gray-300 rounded-md font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
