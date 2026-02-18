import * as vscode from 'vscode';
import { getConfig } from '../utils/config';
import { log } from '../utils/logger';

export type IdleState = 'active' | 'idle' | 'expired';

export interface IdleDetectorEvents {
  onIdle: () => void;
  onActive: () => void;
  onExpired: () => void;
}

export class IdleDetector implements vscode.Disposable {
  private lastActivityTime = Date.now();
  private checkInterval: ReturnType<typeof setInterval> | undefined;
  private currentState: IdleState = 'active';
  private disposables: vscode.Disposable[] = [];

  constructor(private events: IdleDetectorEvents) {}

  start(): void {
    this.lastActivityTime = Date.now();
    this.currentState = 'active';

    // Listen for user activity
    this.disposables.push(
      vscode.window.onDidChangeTextEditorSelection(() => this.recordActivity()),
      vscode.window.onDidChangeActiveTextEditor(() => this.recordActivity()),
      vscode.workspace.onDidChangeTextDocument(() => this.recordActivity()),
      vscode.window.onDidChangeTerminalState(() => this.recordActivity()),
    );

    // Check idle state every 30 seconds
    this.checkInterval = setInterval(() => this.check(), 30_000);
    log('IdleDetector started');
  }

  recordActivity(): void {
    this.lastActivityTime = Date.now();
    if (this.currentState !== 'active') {
      this.currentState = 'active';
      this.events.onActive();
      log('User became active');
    }
  }

  getState(): IdleState {
    return this.currentState;
  }

  private check(): void {
    const config = getConfig();
    const idleMs = Date.now() - this.lastActivityTime;
    const idleThresholdMs = config.idleTimeoutMinutes * 60_000;
    const expiredThresholdMs = config.sessionEndTimeoutMinutes * 60_000;

    if (idleMs >= expiredThresholdMs && this.currentState !== 'expired') {
      this.currentState = 'expired';
      this.events.onExpired();
      log(`Session expired after ${config.sessionEndTimeoutMinutes} min idle`);
    } else if (idleMs >= idleThresholdMs && this.currentState === 'active') {
      this.currentState = 'idle';
      this.events.onIdle();
      log(`User idle after ${config.idleTimeoutMinutes} min`);
    }
  }

  dispose(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }
}
