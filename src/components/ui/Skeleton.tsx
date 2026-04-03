import React, { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
  height?: string;
  width?: string;
  borderRadius?: string;
  count?: number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({
    variant = 'light',
    height = '1rem',
    width = '100%',
    borderRadius = '0.375rem',
    count = 1,
    className,
    ...props
  }, ref) => {
    const bgClass = variant === 'dark' ? 'bg-gray-700' : 'bg-gray-200';

    const skeletons = Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        ref={i === 0 ? ref : undefined}
        className={`
          ${bgClass} animate-pulse
          ${className || ''}
        `}
        style={{
          height,
          width,
          borderRadius,
        }}
        {...props}
      />
    ));

    if (count === 1) {
      return skeletons[0];
    }

    return (
      <div className="flex flex-col gap-3">
        {skeletons}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

interface SkeletonCircleProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SkeletonCircle = React.forwardRef<HTMLDivElement, SkeletonCircleProps>(
  ({
    variant = 'light',
    size = 'md',
    className,
    ...props
  }, ref) => {
    const bgClass = variant === 'dark' ? 'bg-gray-700' : 'bg-gray-200';

    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    };

    return (
      <div
        ref={ref}
        className={`
          rounded-full ${bgClass} animate-pulse
          ${sizeClasses[size]}
          ${className || ''}
        `}
        {...props}
      />
    );
  }
);

SkeletonCircle.displayName = 'SkeletonCircle';

interface CardSkeletonProps {
  variant?: 'light' | 'dark';
  lines?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ variant = 'light', lines = 3 }) => {
  const bgClass = variant === 'dark' ? 'bg-gray-900' : 'bg-white';
  const skeletonClass = variant === 'dark' ? 'bg-gray-700' : 'bg-gray-200';

  return (
    <div className={`${bgClass} rounded-lg p-6 border ${variant === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
      {/* Header skeleton */}
      <Skeleton variant={variant} height="1.5rem" width="60%" className="mb-4" />

      {/* Content skeleton */}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant={variant}
            height="1rem"
            width={i === lines - 1 ? '80%' : '100%'}
          />
        ))}
      </div>
    </div>
  );
};

CardSkeleton.displayName = 'CardSkeleton';
