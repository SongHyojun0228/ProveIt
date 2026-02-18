import { ActivityEvent } from './events';
import { HashEntry } from './verification';

export enum SessionState {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
}

export interface SessionDuration {
  totalMs: number;
  activeMs: number;
  idleMs: number;
}

export interface AICompletionMetrics {
  accepted: number;
  rejected: number;
  modified: number;
  acceptRate: number;
}

export interface AIToolMetrics {
  filesEdited: number;
  linesAdded: number;
  linesDeleted: number;
  toolBreakdown: Record<string, number>;
}

export interface SessionMetrics {
  filesModified: number;
  linesAdded: number;
  linesDeleted: number;
  commits: number;
  terminalCommands: number;
  errorsEncountered: number;
  errorsResolved: number;
  aiCompletions: AICompletionMetrics;
  aiToolEdits?: AIToolMetrics;
}

export interface Session {
  id: string;
  projectId: string;
  startTime: string;
  endTime?: string;
  state: SessionState;
  duration: SessionDuration;
  metrics: SessionMetrics;
  events: ActivityEvent[];
  hashChainEntry?: HashEntry;
}

export function createEmptyMetrics(): SessionMetrics {
  return {
    filesModified: 0,
    linesAdded: 0,
    linesDeleted: 0,
    commits: 0,
    terminalCommands: 0,
    errorsEncountered: 0,
    errorsResolved: 0,
    aiCompletions: {
      accepted: 0,
      rejected: 0,
      modified: 0,
      acceptRate: 0,
    },
    aiToolEdits: {
      filesEdited: 0,
      linesAdded: 0,
      linesDeleted: 0,
      toolBreakdown: {},
    },
  };
}
