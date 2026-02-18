import * as vscode from 'vscode';
import {
  Session,
  SessionState,
  ActivityEvent,
  EventType,
  createEmptyMetrics,
  generateId,
  nowISO,
  elapsedMs,
  type FileChangeData,
  type SessionMetrics,
} from '@proveit/shared';
import { IdleDetector } from './IdleDetector';
import { LocalStorageManager } from '../storage/LocalStorageManager';
import { HashChain } from '../storage/HashChain';
import { PrivacyFilter } from '../privacy/PrivacyFilter';
import { getConfig } from '../utils/config';
import { log, logError } from '../utils/logger';

export class SessionManager implements vscode.Disposable {
  private currentSession: Session | null = null;
  private eventBuffer: ActivityEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | undefined;
  private idleDetector: IdleDetector;
  private pauseStartTime: number | null = null;
  private totalPausedMs = 0;
  private modifiedFiles = new Set<string>();

  private readonly _onSessionStateChanged = new vscode.EventEmitter<SessionState | null>();
  readonly onSessionStateChanged = this._onSessionStateChanged.event;

  constructor(
    private storage: LocalStorageManager,
    private hashChain: HashChain,
    private privacyFilter: PrivacyFilter,
  ) {
    this.idleDetector = new IdleDetector({
      onIdle: () => this.pauseSession('idle'),
      onActive: () => {
        if (this.currentSession?.state === SessionState.PAUSED) {
          this.resumeSession('activity');
        }
      },
      onExpired: () => this.endSession('expired'),
    });
  }

  async startSession(): Promise<Session> {
    if (this.currentSession && this.currentSession.state !== SessionState.ENDED) {
      await this.endSession('new_session');
    }

    const meta = await this.storage.getProjectMeta();

    const session: Session = {
      id: generateId('sess'),
      projectId: meta.id,
      startTime: nowISO(),
      state: SessionState.ACTIVE,
      duration: { totalMs: 0, activeMs: 0, idleMs: 0 },
      metrics: createEmptyMetrics(),
      events: [],
    };

    this.currentSession = session;
    this.eventBuffer = [];
    this.totalPausedMs = 0;
    this.pauseStartTime = null;
    this.modifiedFiles.clear();

    this.idleDetector.start();
    this.startFlushInterval();

    this.addEvent(EventType.SESSION_START, {});
    this._onSessionStateChanged.fire(SessionState.ACTIVE);
    log(`Session started: ${session.id}`);

    return session;
  }

  pauseSession(reason: string = 'manual'): void {
    if (!this.currentSession || this.currentSession.state !== SessionState.ACTIVE) return;

    this.currentSession.state = SessionState.PAUSED;
    this.pauseStartTime = Date.now();
    this.addEvent(EventType.SESSION_PAUSE, { reason });
    this._onSessionStateChanged.fire(SessionState.PAUSED);
    log(`Session paused: ${reason}`);
  }

  resumeSession(reason: string = 'manual'): void {
    if (!this.currentSession || this.currentSession.state !== SessionState.PAUSED) return;

    if (this.pauseStartTime) {
      this.totalPausedMs += Date.now() - this.pauseStartTime;
      this.pauseStartTime = null;
    }

    this.currentSession.state = SessionState.ACTIVE;
    this.addEvent(EventType.SESSION_RESUME, { reason });
    this._onSessionStateChanged.fire(SessionState.ACTIVE);
    log(`Session resumed: ${reason}`);
  }

  async endSession(reason: string = 'manual'): Promise<Session | null> {
    if (!this.currentSession) return null;

    if (this.pauseStartTime) {
      this.totalPausedMs += Date.now() - this.pauseStartTime;
      this.pauseStartTime = null;
    }

    this.currentSession.state = SessionState.ENDED;
    this.currentSession.endTime = nowISO();
    this.updateDuration();
    this.updateMetrics();

    // Flush remaining events
    this.currentSession.events.push(...this.eventBuffer);
    this.eventBuffer = [];

    // Add to hash chain
    const sessionJson = JSON.stringify(this.currentSession);
    const hashEntry = await this.hashChain.append(sessionJson);
    this.currentSession.hashChainEntry = hashEntry;

    // Save
    await this.storage.saveSession(this.currentSession);
    await this.storage.updateProjectMeta({
      totalSessions: (await this.storage.getProjectMeta()).totalSessions + 1,
    });

    const ended = this.currentSession;
    this.idleDetector.dispose();
    this.stopFlushInterval();
    this.currentSession = null;
    this.modifiedFiles.clear();

    this._onSessionStateChanged.fire(null);
    log(`Session ended: ${ended.id} (${reason})`);

    return ended;
  }

  addEvent(type: EventType, data: Record<string, unknown>): void {
    if (!this.currentSession) return;

    const event: ActivityEvent = {
      id: generateId('evt'),
      type,
      timestamp: nowISO(),
      data: data as ActivityEvent['data'],
    };

    const filtered = this.privacyFilter.filterEvent(event);
    if (!filtered) return;

    // Track modified files for metrics
    if (type === EventType.FILE_CHANGE) {
      this.modifiedFiles.add((data as FileChangeData).filePath);
    }

    this.eventBuffer.push(filtered);
    this.idleDetector.recordActivity();
  }

  getState(): SessionState | null {
    return this.currentSession?.state ?? null;
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  private startFlushInterval(): void {
    const config = getConfig();
    this.flushInterval = setInterval(async () => {
      await this.flush();
    }, config.flushIntervalSeconds * 1000);
  }

  private stopFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = undefined;
    }
  }

  private async flush(): Promise<void> {
    if (!this.currentSession || this.eventBuffer.length === 0) return;

    this.currentSession.events.push(...this.eventBuffer);
    this.eventBuffer = [];
    this.updateDuration();
    this.updateMetrics();

    try {
      await this.storage.saveSession(this.currentSession);
    } catch (error) {
      logError('Failed to flush session', error);
    }
  }

  private updateDuration(): void {
    if (!this.currentSession) return;

    const totalMs = elapsedMs(this.currentSession.startTime);
    const currentPauseMs = this.pauseStartTime ? Date.now() - this.pauseStartTime : 0;
    const idleMs = this.totalPausedMs + currentPauseMs;

    this.currentSession.duration = {
      totalMs,
      activeMs: Math.max(0, totalMs - idleMs),
      idleMs,
    };
  }

  private updateMetrics(): void {
    if (!this.currentSession) return;

    const allEvents = [...this.currentSession.events, ...this.eventBuffer];
    const metrics: SessionMetrics = createEmptyMetrics();

    metrics.filesModified = this.modifiedFiles.size;

    for (const event of allEvents) {
      switch (event.type) {
        case EventType.FILE_CHANGE: {
          const d = event.data as FileChangeData;
          metrics.linesAdded += d.linesAdded;
          metrics.linesDeleted += d.linesDeleted;
          break;
        }
        case EventType.GIT_COMMIT:
          metrics.commits++;
          break;
        case EventType.TERMINAL_COMMAND:
          metrics.terminalCommands++;
          break;
        case EventType.ERROR_OCCURRED:
          metrics.errorsEncountered++;
          break;
        case EventType.ERROR_RESOLVED:
          metrics.errorsResolved++;
          break;
        case EventType.AI_COMPLETION_ACCEPTED:
          metrics.aiCompletions.accepted++;
          break;
        case EventType.AI_COMPLETION_REJECTED:
          metrics.aiCompletions.rejected++;
          break;
        case EventType.AI_COMPLETION_MODIFIED:
          metrics.aiCompletions.modified++;
          break;
      }
    }

    const totalAI =
      metrics.aiCompletions.accepted +
      metrics.aiCompletions.rejected +
      metrics.aiCompletions.modified;
    metrics.aiCompletions.acceptRate = totalAI > 0 ? metrics.aiCompletions.accepted / totalAI : 0;

    this.currentSession.metrics = metrics;
  }

  dispose(): void {
    this.idleDetector.dispose();
    this.stopFlushInterval();
    this._onSessionStateChanged.dispose();
  }
}
