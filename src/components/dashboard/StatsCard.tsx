import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
    label?: string;
  };
  variant?: 'default' | 'dark';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  trend,
  variant = 'default',
  loading = false,
  className,
  onClick,
}) => {
  if (loading) {
    return (
      <Card variant={variant} className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const textColor = variant === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const valueColor = variant === 'dark' ? 'text-white' : 'text-gray-900';
  const trendColor = trend?.direction === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <Card
      variant={variant}
      interactive={!!onClick}
      onClick={onClick}
      className={className}
    >
      <CardContent className="p-6">
        {/* Header with icon and label */}
        <div className="flex items-start justify-between mb-4">
          <p className={`text-sm font-medium ${textColor}`}>
            {label}
          </p>

          {icon && (
            <div className={variant === 'dark' ? 'text-green-500' : 'text-green-600'}>
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <p className={`text-3xl font-bold ${valueColor} mb-4`}>
          {value}
        </p>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${trendColor}`}>
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">
                {trend.percentage}%
              </span>
            </div>
            {trend.label && (
              <p className={`text-xs ${textColor}`}>
                {trend.label}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

StatsCard.displayName = 'StatsCard';
