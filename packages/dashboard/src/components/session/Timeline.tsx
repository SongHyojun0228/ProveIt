import { Badge } from '@/components/shared/Badge';
import { formatTime } from '@/lib/format';

interface Event {
  id: string;
  type: string;
  timestamp: string;
  data: Record<string, any>;
}

const typeColor: Record<string, string> = {
  file_change: 'blue',
  file_create: 'green',
  file_delete: 'red',
  git_commit: 'purple',
  git_branch_switch: 'purple',
  git_push: 'purple',
  ai_completion_accepted: 'green',
  ai_completion_rejected: 'red',
  ai_completion_modified: 'yellow',
  terminal_command: 'gray',
  error_occurred: 'red',
  error_resolved: 'green',
  session_start: 'blue',
  session_pause: 'yellow',
  session_resume: 'blue',
};

function eventLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function eventDetail(type: string, data: Record<string, any>): string {
  switch (type) {
    case 'file_change':
      return `${data.filePath} (+${data.linesAdded} -${data.linesDeleted})`;
    case 'file_create':
    case 'file_delete':
      return data.filePath || '';
    case 'git_commit':
      return data.message || '';
    case 'terminal_command':
      return data.command || '';
    case 'error_occurred':
      return data.message || '';
    case 'error_resolved':
      return `${data.filePath} (${Math.round(data.resolutionTimeMs / 1000)}s)`;
    case 'ai_completion_accepted':
    case 'ai_completion_rejected':
    case 'ai_completion_modified':
      return `${data.language} (${data.completionLength} chars)`;
    default:
      return data.reason || '';
  }
}

export function Timeline({ events }: { events: Event[] }) {
  const displayed = events.slice(0, 100);

  return (
    <div className="space-y-1">
      {displayed.map((event) => (
        <div key={event.id} className="flex items-start gap-2 py-1.5 text-xs">
          <span className="text-gray-400 font-mono w-16 flex-shrink-0">
            {formatTime(event.timestamp)}
          </span>
          <Badge color={typeColor[event.type] || 'gray'}>{eventLabel(event.type)}</Badge>
          <span className="text-gray-600 truncate">{eventDetail(event.type, event.data)}</span>
        </div>
      ))}
      {events.length > 100 && (
        <p className="text-xs text-gray-400 pt-2">+ {events.length - 100} more events</p>
      )}
    </div>
  );
}
