'use client';

import Link from 'next/link';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { formatDuration, formatDateTime } from '@/lib/format';

interface Session {
  id: string;
  projectId: string;
  startTime: string;
  state: string;
  duration: { activeMs: number };
  metrics: { filesModified: number; linesAdded: number; aiCompletions: { acceptRate: number } };
}

export function RecentSessions({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) return null;

  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Sessions</h3>
      <div className="space-y-2">
        {sessions.slice(0, 5).map((s) => (
          <Link
            key={s.id}
            href={`/sessions/${s.id}`}
            className="flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 transition-colors"
          >
            <div>
              <span className="text-sm font-medium">{s.id.slice(0, 16)}</span>
              <span className="text-xs text-gray-500 ml-2">{formatDateTime(s.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge color={s.state === 'ended' ? 'green' : 'yellow'}>{s.state}</Badge>
              <span className="text-xs text-gray-500">{formatDuration(s.duration.activeMs)}</span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
