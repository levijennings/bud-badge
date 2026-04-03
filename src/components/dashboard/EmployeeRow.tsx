import React, { useState } from 'react';
import { MoreVertical, ChevronRight } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

type UserRole = 'owner' | 'manager' | 'budtender';

interface EmployeeRowProps {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  role: UserRole;
  trainingProgress: number; // 0-100
  trainingStatus?: 'not-started' | 'in-progress' | 'complete';
  completedModules?: number;
  totalModules?: number;
  lastActivity?: Date;
  complianceStatus?: 'compliant' | 'warning' | 'non-compliant';
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }>;
  onRowPress?: (employeeId: string) => void;
  className?: string;
}

export const EmployeeRow: React.FC<EmployeeRowProps> = ({
  id,
  name,
  avatar,
  initials,
  role,
  trainingProgress,
  trainingStatus = 'not-started',
  completedModules = 0,
  totalModules = 0,
  lastActivity,
  complianceStatus,
  actions,
  onRowPress,
  className,
}) => {
  const [showActionMenu, setShowActionMenu] = useState(false);

  const formatLastActivity = (date?: Date) => {
    if (!date) return 'No activity';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const statusConfig = {
    compliant: { variant: 'success' as const, label: 'Compliant' },
    warning: { variant: 'warning' as const, label: 'Warning' },
    'non-compliant': { variant: 'error' as const, label: 'Non-Compliant' },
  };

  const complianceConfig = complianceStatus
    ? statusConfig[complianceStatus]
    : null;

  return (
    <div
      className={`
        px-6 py-4 border-b border-gray-200 hover:bg-gray-50
        transition-colors duration-200 flex items-center gap-4
        ${onRowPress ? 'cursor-pointer' : ''}
        ${className || ''}
      `}
      onClick={() => onRowPress?.(id)}
    >
      {/* Avatar & Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar
          src={avatar}
          initials={initials}
          alt={name}
          size="md"
          role={role}
          showRole
        />
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Badge variant={role} size="sm">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
            {complianceConfig && (
              <Badge variant={complianceConfig.variant} size="sm">
                {complianceConfig.label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Training Progress */}
      <div className="hidden md:flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <ProgressBar
            percentage={trainingProgress}
            status={
              trainingStatus === 'complete'
                ? 'complete'
                : trainingStatus === 'in-progress'
                  ? 'in-progress'
                  : 'pending'
            }
            showLabel={false}
            size="sm"
          />
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-gray-700">
            {completedModules}/{totalModules}
          </p>
          <p className="text-xs text-gray-500">
            {trainingProgress}%
          </p>
        </div>
      </div>

      {/* Last Activity */}
      <div className="hidden lg:block">
        <p className="text-sm text-gray-700 font-medium">
          {formatLastActivity(lastActivity)}
        </p>
      </div>

      {/* Actions Menu */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowActionMenu(!showActionMenu);
          }}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          aria-label="More actions"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* Dropdown Menu */}
        {showActionMenu && actions && actions.length > 0 && (
          <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-max">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                  setShowActionMenu(false);
                }}
                className={`
                  block w-full text-left px-4 py-2 text-sm hover:bg-gray-100
                  transition-colors font-medium
                  ${action.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700'
                  }
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chevron */}
      {onRowPress && (
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      )}
    </div>
  );
};

EmployeeRow.displayName = 'EmployeeRow';
