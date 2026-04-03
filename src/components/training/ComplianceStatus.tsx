import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface ComplianceRequirement {
  id: string;
  name: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  daysUntilExpiry?: number;
}

interface ComplianceStatusProps {
  overallStatus: 'compliant' | 'warning' | 'non-compliant';
  requirements: ComplianceRequirement[];
  actionItems: Array<{
    id: string;
    title: string;
    description: string;
    dueDate?: Date;
  }>;
  onViewDetails?: () => void;
  className?: string;
}

export const ComplianceStatus: React.FC<ComplianceStatusProps> = ({
  overallStatus,
  requirements,
  actionItems,
  onViewDetails,
  className,
}) => {
  const statusConfig = {
    compliant: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      badge: 'success' as const,
      label: 'Compliant',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badge: 'warning' as const,
      label: 'Warning',
    },
    'non-compliant': {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      badge: 'error' as const,
      label: 'Non-Compliant',
    },
  };

  const config = statusConfig[overallStatus];
  const StatusIcon = config.icon;

  const compliantCount = requirements.filter((r) => r.status === 'compliant').length;
  const warningCount = requirements.filter((r) => r.status === 'warning').length;
  const nonCompliantCount = requirements.filter((r) => r.status === 'non-compliant').length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Compliance Status
          </h3>
          <Badge variant={config.badge}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} border`}>
          <div className="flex items-start gap-3">
            <StatusIcon className={`w-6 h-6 ${config.color} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {config.label} Overall
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {compliantCount} compliant, {warningCount} warning, {nonCompliantCount} non-compliant
              </p>
            </div>
          </div>
        </div>

        {/* Requirements Breakdown */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Requirements Breakdown
          </h4>

          <div className="space-y-2">
            {requirements.map((req) => {
              const reqConfig = statusConfig[req.status];
              const ReqIcon = reqConfig.icon;

              return (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <ReqIcon className={`w-5 h-5 ${reqConfig.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {req.name}
                      </p>
                      {req.daysUntilExpiry && req.daysUntilExpiry <= 30 && (
                        <p className="text-xs text-amber-600 mt-0.5">
                          Expires in {req.daysUntilExpiry} days
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={reqConfig.badge} size="sm">
                    {reqConfig.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Items */}
        {actionItems.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Action Items ({actionItems.length})
            </h4>

            <div className="space-y-2">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-red-50 border border-red-200"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-red-700 mt-0.5">
                      {item.description}
                    </p>
                    {item.dueDate && (
                      <p className="text-xs text-red-600 font-semibold mt-1">
                        Due: {new Intl.DateTimeFormat('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }).format(item.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Details Link */}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
          >
            View Full Report
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </CardContent>
    </Card>
  );
};

ComplianceStatus.displayName = 'ComplianceStatus';
