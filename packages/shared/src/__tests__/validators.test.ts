import { describe, it, expect } from 'vitest';
import {
  SessionSchema,
  SessionMetricsSchema,
  HashEntrySchema,
  ProjectMetaSchema,
} from '../schemas/validators';
import { SessionState } from '../types/session';

describe('SessionMetricsSchema', () => {
  it('validates correct metrics', () => {
    const metrics = {
      filesModified: 5,
      linesAdded: 100,
      linesDeleted: 20,
      commits: 2,
      terminalCommands: 10,
      errorsEncountered: 3,
      errorsResolved: 2,
      aiCompletions: { accepted: 5, rejected: 3, modified: 1, acceptRate: 0.555 },
    };
    expect(() => SessionMetricsSchema.parse(metrics)).not.toThrow();
  });

  it('rejects negative values', () => {
    const metrics = {
      filesModified: -1,
      linesAdded: 0,
      linesDeleted: 0,
      commits: 0,
      terminalCommands: 0,
      errorsEncountered: 0,
      errorsResolved: 0,
      aiCompletions: { accepted: 0, rejected: 0, modified: 0, acceptRate: 0 },
    };
    expect(() => SessionMetricsSchema.parse(metrics)).toThrow();
  });
});

describe('HashEntrySchema', () => {
  it('validates correct hash entry', () => {
    const entry = {
      index: 0,
      hash: 'sha256:abc123',
      previousHash: 'sha256:000000',
      timestamp: '2024-01-01T00:00:00.000Z',
      dataHash: 'sha256:def456',
    };
    expect(() => HashEntrySchema.parse(entry)).not.toThrow();
  });
});

describe('SessionSchema', () => {
  it('validates a complete session', () => {
    const session = {
      id: 'sess_abc123',
      projectId: 'proj_def456',
      startTime: '2024-01-01T00:00:00.000Z',
      endTime: '2024-01-01T02:00:00.000Z',
      state: SessionState.ENDED,
      duration: { totalMs: 7200000, activeMs: 6000000, idleMs: 1200000 },
      metrics: {
        filesModified: 5,
        linesAdded: 100,
        linesDeleted: 20,
        commits: 2,
        terminalCommands: 10,
        errorsEncountered: 3,
        errorsResolved: 2,
        aiCompletions: { accepted: 5, rejected: 3, modified: 1, acceptRate: 0.555 },
      },
      events: [],
    };
    expect(() => SessionSchema.parse(session)).not.toThrow();
  });

  it('allows missing endTime for active sessions', () => {
    const session = {
      id: 'sess_abc123',
      projectId: 'proj_def456',
      startTime: '2024-01-01T00:00:00.000Z',
      state: SessionState.ACTIVE,
      duration: { totalMs: 0, activeMs: 0, idleMs: 0 },
      metrics: {
        filesModified: 0,
        linesAdded: 0,
        linesDeleted: 0,
        commits: 0,
        terminalCommands: 0,
        errorsEncountered: 0,
        errorsResolved: 0,
        aiCompletions: { accepted: 0, rejected: 0, modified: 0, acceptRate: 0 },
      },
      events: [],
    };
    expect(() => SessionSchema.parse(session)).not.toThrow();
  });
});

describe('ProjectMetaSchema', () => {
  it('validates correct project meta', () => {
    const meta = {
      id: 'proj_abc123',
      name: 'My Project',
      rootPath: '/home/user/project',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      privacy: {
        trackFileContents: true,
        trackTerminalCommands: true,
        trackAICompletions: true,
        excludePatterns: ['.env'],
      },
      totalSessions: 5,
    };
    expect(() => ProjectMetaSchema.parse(meta)).not.toThrow();
  });
});
