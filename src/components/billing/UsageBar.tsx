/**
 * Bud Badge Usage Bar Component
 * Progress bar showing usage vs limits
 */

interface UsageBarProps {
  used: number;
  limit: number | null;
  percentage: number;
}

export function UsageBar({ used, limit, percentage }: UsageBarProps) {
  const isAtLimit = limit !== null && percentage >= 100;
  const isNearLimit = limit !== null && percentage >= 80;

  let barColor = "bg-green-500";
  if (isAtLimit) {
    barColor = "bg-red-500";
  } else if (isNearLimit) {
    barColor = "bg-amber-500";
  }

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {percentage}% of {limit ? limit.toLocaleString() : "unlimited"}
      </p>
    </div>
  );
}
