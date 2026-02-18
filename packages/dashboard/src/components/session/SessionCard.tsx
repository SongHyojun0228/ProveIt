import Link from 'next/link';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { formatDuration, formatDateTime, formatPercent } from '@/lib/format';

interface Session {
  id: string;
  projectId: string;
  startTime: string;
  state: string;
  duration: { activeMs: number };
  metrics: {
    filesModified: number;
    linesAdded: number;
    linesDeleted: number;
    commits: number;
    aiCompletions: { acceptRate: number; accepted: number; rejected: number; modified: number };
  };
}

export function SessionCard({ session }: { session: Session }) {
  const totalAI =
    session.metrics.aiCompletions.accepted +
    session.metrics.aiCompletions.rejected +
    session.metrics.aiCompletions.modified;

  return (
    <Link href={`/sessions/${session.id}`}>
      <Card className="hover:border-brand-300 transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-mono text-gray-700">{session.id.slice(0, 20)}</span>
          <Badge color={session.state === 'ended' ? 'green' : 'yellow'}>{session.state}</Badge>
        </div>
        <p className="text-xs text-gray-500 mb-2">{formatDateTime(session.startTime)}</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div>
            <span className="text-gray-400">Time</span>
            <p className="font-medium">{formatDuration(session.duration.activeMs)}</p>
          </div>
          <div>
            <span className="text-gray-400">Lines</span>
            <p className="font-medium">
              +{session.metrics.linesAdded} -{session.metrics.linesDeleted}
            </p>
          </div>
          <div>
            <span className="text-gray-400">AI</span>
            <p className="font-medium">{totalAI > 0 ? formatPercent(session.metrics.aiCompletions.acceptRate) : 'N/A'}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
