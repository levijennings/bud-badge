import React, { HTMLAttributes } from 'react';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  percentage: number;
  status?: 'in-progress' | 'complete' | 'pending';
  animated?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({
    percentage,
    status = 'in-progress',
    animated = true,
    showLabel = true,
    size = 'md',
    className,
    ...props
  }, ref) => {
    const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);

    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    const fillColorClass = {
      'complete': 'bg-gradient-to-r from-green-500 to-green-600',
      'in-progress': 'bg-gradient-to-r from-amber-400 to-amber-500',
      'pending': 'bg-gray-300',
    }[status];

    return (
      <div className="w-full" {...props} ref={ref}>
        <div
          className={`
            w-full bg-gray-200 rounded-full overflow-hidden
            ${sizeClasses[size]}
          `}
          role="progressbar"
          aria-valuenow={normalizedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress"
        >
          <div
            className={`
              ${fillColorClass} ${sizeClasses[size]} rounded-full
              transition-all duration-500 ease-out
              ${animated && status !== 'pending' ? 'animate-pulse' : ''}
            `}
            style={{ width: `${normalizedPercentage}%` }}
          />
        </div>

        {showLabel && (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-600 font-medium">
              {status === 'complete' ? 'Complete' : status === 'pending' ? 'Not Started' : 'In Progress'}
            </p>
            <p className="text-xs font-semibold text-gray-700">
              {normalizedPercentage}%
            </p>
          </div>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  status?: 'in-progress' | 'complete' | 'pending';
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  label,
  status = 'in-progress',
}) => {
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedPercentage / 100) * circumference;

  const strokeColor = {
    'complete': '#16a34a',
    'in-progress': '#f59e0b',
    'pending': '#d1d5db',
  }[status];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {label && (
          <div className="absolute text-center">
            <p className="text-lg font-semibold text-gray-900">{normalizedPercentage}%</p>
            <p className="text-xs text-gray-600">{label}</p>
          </div>
        )}
      </div>
    </div>
  );
};

ProgressRing.displayName = 'ProgressRing';
