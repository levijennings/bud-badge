import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    className,
    children,
    ...props
  }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center gap-2 font-medium
      rounded-md transition-colors duration-200 font-outfit
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variantClasses = {
      primary: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
      outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50 active:bg-gray-100',
      ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${widthClass}
          ${className || ''}
        `}
        {...props}
      >
        {loading && (
          <div className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}

        {icon && iconPosition === 'left' && !loading && icon}

        {children}

        {icon && iconPosition === 'right' && !loading && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';
