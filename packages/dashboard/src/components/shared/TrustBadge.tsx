'use client';

const gradeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  high: {
    label: 'High Trust',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    icon: '\u25CF',
  },
  medium: {
    label: 'Medium Trust',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50 border-yellow-200',
    icon: '\u25CF',
  },
  low: {
    label: 'Low Trust',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: '\u25CF',
  },
};

interface TrustBadgeProps {
  grade: string;
  chainLength: number;
  message?: string;
  compact?: boolean;
}

export function TrustBadge({ grade, chainLength, message, compact = false }: TrustBadgeProps) {
  const config = gradeConfig[grade] || gradeConfig.medium;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}
        title={message}
      >
        <span className="text-[8px]">{config.icon}</span>
        {config.label}
      </span>
    );
  }

  return (
    <div className={`rounded-lg border p-3 ${config.bg}`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${config.color}`}>{config.icon}</span>
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        <span className="text-xs text-gray-500">({chainLength} sessions verified)</span>
      </div>
      {message && <p className="text-xs text-gray-600 mt-1">{message}</p>}
    </div>
  );
}
