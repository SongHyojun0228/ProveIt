import { Card } from '@/components/shared/Card';
import { formatDuration, formatPercent } from '@/lib/format';

interface Metrics {
  filesModified: number;
  linesAdded: number;
  linesDeleted: number;
  commits: number;
  terminalCommands: number;
  errorsEncountered: number;
  errorsResolved: number;
  aiCompletions: { accepted: number; rejected: number; modified: number; acceptRate: number };
  aiToolEdits?: { filesEdited: number; linesAdded: number; linesDeleted: number; toolBreakdown: Record<string, number> };
}

interface Duration {
  totalMs: number;
  activeMs: number;
  idleMs: number;
}

export function MetricsGrid({ metrics, duration }: { metrics: Metrics; duration: Duration }) {
  const totalAI = metrics.aiCompletions.accepted + metrics.aiCompletions.rejected + metrics.aiCompletions.modified;
  const aiToolLines = metrics.aiToolEdits
    ? metrics.aiToolEdits.linesAdded + metrics.aiToolEdits.linesDeleted
    : 0;

  const items = [
    { label: 'Active Time', value: formatDuration(duration.activeMs) },
    { label: 'Idle Time', value: formatDuration(duration.idleMs) },
    { label: 'Files Modified', value: metrics.filesModified.toString() },
    { label: 'Lines Added', value: `+${metrics.linesAdded}` },
    { label: 'Lines Deleted', value: `-${metrics.linesDeleted}` },
    { label: 'Commits', value: metrics.commits.toString() },
    { label: 'Terminal Commands', value: metrics.terminalCommands.toString() },
    { label: 'Errors', value: `${metrics.errorsResolved}/${metrics.errorsEncountered} resolved` },
    { label: 'AI Completions', value: totalAI.toString() },
    { label: 'AI Accept Rate', value: totalAI > 0 ? formatPercent(metrics.aiCompletions.acceptRate) : 'N/A' },
    { label: 'AI Tool Edits', value: metrics.aiToolEdits ? metrics.aiToolEdits.filesEdited.toString() + ' files' : 'N/A' },
    { label: 'AI Tool Lines', value: aiToolLines > 0 ? aiToolLines.toString() : 'N/A' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {items.map((item) => (
        <Card key={item.label} className="py-3">
          <p className="text-xs text-gray-500">{item.label}</p>
          <p className="text-base font-semibold mt-0.5">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
