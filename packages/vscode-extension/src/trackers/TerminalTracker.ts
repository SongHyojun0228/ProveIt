import * as vscode from 'vscode';
import { EventType, TerminalCommandCategory } from '@proveit/shared';
import { SessionManager } from '../session/SessionManager';
import { log } from '../utils/logger';

const COMMAND_PATTERNS: [RegExp, TerminalCommandCategory][] = [
  [/^(npm|pnpm|yarn)\s+(run\s+)?(build|compile)/, TerminalCommandCategory.BUILD],
  [/^(tsc|esbuild|webpack|vite\s+build|rollup)/, TerminalCommandCategory.BUILD],
  [/^(make|cargo\s+build|go\s+build|gradle\s+build)/, TerminalCommandCategory.BUILD],
  [/^(npm|pnpm|yarn)\s+(run\s+)?test/, TerminalCommandCategory.TEST],
  [/^(jest|vitest|mocha|pytest|cargo\s+test|go\s+test)/, TerminalCommandCategory.TEST],
  [/^(npm|pnpm|yarn)\s+(install|add|remove|uninstall)/, TerminalCommandCategory.INSTALL],
  [/^(pip\s+install|cargo\s+add|go\s+get|brew\s+install)/, TerminalCommandCategory.INSTALL],
  [/^git\s+/, TerminalCommandCategory.GIT],
  [/^(node\s+--inspect|lldb|gdb|debugger)/, TerminalCommandCategory.DEBUG],
  [/^(npm|pnpm|yarn)\s+(run\s+)?(start|dev|serve)/, TerminalCommandCategory.RUN],
  [/^(node|python|cargo\s+run|go\s+run)\s+/, TerminalCommandCategory.RUN],
];

export class TerminalTracker implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];
  private lineBuffer = new Map<number, string>();

  constructor(private sessionManager: SessionManager) {}

  start(): void {
    this.disposables.push(
      vscode.window.onDidWriteTerminalData((e) => this.onTerminalData(e)),
    );
    log('TerminalTracker started');
  }

  private onTerminalData(e: vscode.TerminalDataWriteEvent): void {
    const pid = e.terminal.processId;
    if (!pid) return;

    // Use a numeric key; accumulate data per terminal
    const terminalKey = e.terminal.creationOptions?.toString().length ?? 0;
    const existing = this.lineBuffer.get(terminalKey) ?? '';
    const combined = existing + e.data;

    // Check for newline — a command was submitted
    if (combined.includes('\r') || combined.includes('\n')) {
      const lines = combined.split(/[\r\n]+/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 2) {
          this.recordCommand(trimmed);
        }
      }
      this.lineBuffer.delete(terminalKey);
    } else {
      this.lineBuffer.set(terminalKey, combined);
    }
  }

  private recordCommand(command: string): void {
    // Strip ANSI escape codes
    const clean = command.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').trim();
    if (!clean || clean.length < 2) return;

    const category = this.categorize(clean);

    this.sessionManager.addEvent(EventType.TERMINAL_COMMAND, {
      command: this.sanitizeCommand(clean),
      category,
    });
  }

  private categorize(command: string): TerminalCommandCategory {
    for (const [pattern, category] of COMMAND_PATTERNS) {
      if (pattern.test(command)) return category;
    }
    return TerminalCommandCategory.OTHER;
  }

  private sanitizeCommand(command: string): string {
    // Remove potential secrets from commands
    return command
      .replace(/(-p|--password|--token|--secret|--key)\s+\S+/g, '$1 [REDACTED]')
      .replace(/(https?:\/\/[^:]+:)[^@]+(@)/g, '$1[REDACTED]$2')
      .substring(0, 200);
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
    this.lineBuffer.clear();
  }
}
