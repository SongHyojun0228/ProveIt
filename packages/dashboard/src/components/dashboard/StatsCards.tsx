'use client';

import { Card } from '@/components/shared/Card';
import { formatDuration, formatPercent, formatNumber } from '@/lib/format';

interface Stats {
  totalSessions: number;
  totalActiveTimeMs: number;
  aiUsageRate: number;
  linesAdded: number;
}

export function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'Total Time', value: formatDuration(stats.totalActiveTimeMs) },
    { label: 'Sessions', value: formatNumber(stats.totalSessions) },
    { label: 'AI Usage', value: formatPercent(stats.aiUsageRate) },
    { label: 'Lines Written', value: formatNumber(stats.linesAdded) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{card.label}</p>
          <p className="text-2xl font-semibold mt-1">{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
