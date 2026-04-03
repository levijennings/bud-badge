import React, { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'owner' | 'manager' | 'budtender';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    variant = 'neutral',
    size = 'md',
    className,
    children,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs font-medium',
      md: 'px-3 py-1 text-sm font-medium',
    };

    const variantClasses = {
      success: 'bg-green-100 text-green-800 border border-green-200',
      warning: 'bg-amber-100 text-amber-800 border border-amber-200',
      error: 'bg-red-100 text-red-800 border border-red-200',
      info: 'bg-blue-100 text-blue-800 border border-blue-200',
      neutral: 'bg-gray-100 text-gray-800 border border-gray-200',
      owner: 'bg-green-100 text-green-800 border border-green-300',
      manager: 'bg-blue-100 text-blue-800 border border-blue-300',
      budtender: 'bg-gray-100 text-gray-800 border border-gray-300',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center rounded-full font-medium
          transition-colors duration-200
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
