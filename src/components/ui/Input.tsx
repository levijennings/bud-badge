import React, { InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'search' | 'password';
  disabled?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    variant = 'default',
    disabled = false,
    className,
    id,
    type: initialType,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [type, setType] = useState(initialType || variant === 'password' ? 'password' : 'text');

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
      setType(showPassword ? 'password' : 'text');
    };

    const baseInputClasses = `
      block w-full px-3 py-2 border rounded-md text-sm font-medium
      transition-colors duration-200
      bg-white text-gray-900 placeholder-gray-400
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variantClasses = {
      default: `
        border-gray-300 focus:ring-green-500 focus:border-green-500
        ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
      `,
      search: `
        border-gray-300 focus:ring-green-500 focus:border-green-500 pl-10
        ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
      `,
      password: `
        border-gray-300 focus:ring-green-500 focus:border-green-500 pr-10
        ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
      `,
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {variant === 'search' && (
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={`
              ${baseInputClasses}
              ${variantClasses[variant]}
              ${className || ''}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />

          {variant === 'password' && (
            <button
              type="button"
              onClick={handleTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
