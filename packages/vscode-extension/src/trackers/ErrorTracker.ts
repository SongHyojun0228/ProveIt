import * as vscode from 'vscode';
import { EventType } from '@proveit/shared';
import { SessionManager } from '../session/SessionManager';
import { log } from '../utils/logger';

interface TrackedError {
  key: string;
  filePath: string;
  message: string;
  occurredAt: number;
}

export class ErrorTracker implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];
  private activeErrors = new Map<string, TrackedError>();

  constructor(private sessionManager: SessionManager) {}

  start(): void {
    this.disposables.push(
      vscode.languages.onDidChangeDiagnostics((e) => this.onDiagnosticsChange(e)),
    );
    log('ErrorTracker started');
  }

  private onDiagnosticsChange(e: vscode.DiagnosticChangeEvent): void {
    for (const uri of e.uris) {
      if (uri.scheme !== 'file') continue;
      const filePath = vscode.workspace.asRelativePath(uri);
      const diagnostics = vscode.languages.getDiagnostics(uri);

      const currentErrors = new Set<string>();

      for (const diag of diagnostics) {
        if (diag.severity > vscode.DiagnosticSeverity.Warning) continue;

        const severity = diag.severity === vscode.DiagnosticSeverity.Error ? 'error' : 'warning';
        const key = `${filePath}:${diag.range.start.line}:${diag.message}`;
        currentErrors.add(key);

        if (!this.activeErrors.has(key)) {
          this.activeErrors.set(key, {
            key,
            filePath,
            message: diag.message,
            occurredAt: Date.now(),
          });

          this.sessionManager.addEvent(EventType.ERROR_OCCURRED, {
            filePath,
            message: diag.message.substring(0, 500),
            severity,
            source: diag.source,
            code: typeof diag.code === 'object' ? String(diag.code.value) : String(diag.code ?? ''),
          });
        }
      }

      // Check for resolved errors in this file
      for (const [key, tracked] of this.activeErrors) {
        if (tracked.filePath === filePath && !currentErrors.has(key)) {
          const resolutionTimeMs = Date.now() - tracked.occurredAt;
          this.sessionManager.addEvent(EventType.ERROR_RESOLVED, {
            filePath: tracked.filePath,
            message: tracked.message.substring(0, 500),
            resolutionTimeMs,
          });
          this.activeErrors.delete(key);
        }
      }
    }
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
    this.activeErrors.clear();
  }
}
