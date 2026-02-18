import { minimatch } from 'minimatch';
import { ActivityEvent, EventType, FileChangeData, FileCreateData } from '@proveit/shared';
import { getConfig } from '../utils/config';

const SENSITIVE_PATTERNS = [
  '*.env', '*.env.*', '*.pem', '*.key', '*.p12', '*.pfx',
  '*secret*', '*credential*', '*password*', '*.keystore',
];

export class PrivacyFilter {
  isFileExcluded(filePath: string): boolean {
    const config = getConfig();
    const allPatterns = [...SENSITIVE_PATTERNS, ...config.excludePatterns];
    const fileName = filePath.split('/').pop() ?? filePath;
    return allPatterns.some((pattern) => minimatch(fileName, pattern, { nocase: true }));
  }

  filterEvent(event: ActivityEvent): ActivityEvent | null {
    if (
      event.type === EventType.FILE_CHANGE ||
      event.type === EventType.FILE_CREATE
    ) {
      const data = event.data as FileChangeData | FileCreateData;
      if (this.isFileExcluded(data.filePath)) {
        return null;
      }
    }

    if (event.type === EventType.FILE_DELETE) {
      const data = event.data as { filePath: string };
      if (this.isFileExcluded(data.filePath)) {
        return null;
      }
    }

    return event;
  }

  filterEvents(events: ActivityEvent[]): ActivityEvent[] {
    return events.filter((e) => this.filterEvent(e) !== null);
  }
}
