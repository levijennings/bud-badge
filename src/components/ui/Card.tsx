import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark';
  interactive?: boolean;
  selected?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    interactive = false,
    selected = false,
    className,
    children,
    ...props
  }, ref) => {
    const baseClasses = `
      rounded-lg border transition-all duration-200
    `;

    const variantClasses = {
      default: `
        bg-white border-gray-200
        ${interactive
          ? 'cursor-pointer hover:shadow-md hover:border-green-300'
          : 'shadow-sm'
        }
        ${selected ? 'border-green-500 shadow-md bg-green-50' : ''}
      `,
      dark: `
        bg-gray-900 border-gray-800
        ${interactive
          ? 'cursor-pointer hover:shadow-lg hover:border-green-500'
          : 'shadow-lg'
        }
        ${selected ? 'border-green-500 shadow-lg' : ''}
      `,
    };

    return (
      <div
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark';
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    const bgClass = variant === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';

    return (
      <div
        ref={ref}
        className={`
          px-6 py-4 border-b ${bgClass}
          ${className || ''}
        `}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`p-6 ${className || ''}`}
      {...props}
    />
  )
);

CardContent.displayName = 'CardContent';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark';
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    const bgClass = variant === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';

    return (
      <div
        ref={ref}
        className={`
          px-6 py-4 border-t ${bgClass} flex justify-end gap-3
          ${className || ''}
        `}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';
