import React from 'react';
import { Lock, Play, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

export interface ModuleCardProps {
  id: string;
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  progress?: number; // 0-100
  started?: boolean;
  completed?: boolean;
  isPremium?: boolean;
  hasAccess?: boolean;
  onPress: (moduleId: string) => void;
  className?: string;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  id,
  title,
  category,
  difficulty,
  duration,
  progress = 0,
  started = false,
  completed = false,
  isPremium = false,
  hasAccess = true,
  onPress,
  className,
}) => {
  const isLocked = isPremium && !hasAccess;
  const difficultyColor = {
    beginner: 'info',
    intermediate: 'warning',
    advanced: 'error',
  } as const;

  return (
    <Card
      interactive
      selected={completed}
      onClick={() => !isLocked && onPress(id)}
      className={`h-full overflow-hidden ${isLocked ? 'opacity-60 cursor-not-allowed' : ''} ${className || ''}`}
    >
      <CardContent className="p-4">
        {/* Header with status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
              {title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="neutral" size="sm">
                {category}
              </Badge>
              <Badge variant={difficultyColor[difficulty]} size="sm">
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
            </div>
          </div>

          {isLocked && (
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0 ml-2" aria-label="Premium feature" />
          )}

          {completed && !isLocked && (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" aria-label="Completed" />
          )}
        </div>

        {/* Progress bar if started */}
        {started && !completed && !isLocked && (
          <div className="mb-3">
            <ProgressBar
              percentage={progress}
              status={progress === 100 ? 'complete' : 'in-progress'}
              showLabel={false}
              size="sm"
            />
          </div>
        )}

        {/* Footer with duration and action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-600 font-medium">
            {duration} min
          </span>

          {!isLocked && (
            <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
              <Play className="w-3 h-3" />
              {completed ? 'Review' : started ? 'Continue' : 'Start'}
            </div>
          )}

          {isLocked && (
            <span className="text-xs text-amber-600 font-medium">Unlock</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

ModuleCard.displayName = 'ModuleCard';
