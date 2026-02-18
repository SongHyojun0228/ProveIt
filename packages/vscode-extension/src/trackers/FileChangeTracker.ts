import * as vscode from 'vscode';
import { EventType } from '@proveit/shared';
import { SessionManager } from '../session/SessionManager';
import { debounce } from '../utils/debounce';
import { log } from '../utils/logger';

export class FileChangeTracker implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];
  private pendingChanges = new Map<string, { added: number; deleted: number; size: number }>();
  private debouncedFlush: ReturnType<typeof debounce>;

  constructor(private sessionManager: SessionManager) {
    this.debouncedFlush = debounce(() => this.flushPendingChanges(), 500);
  }

  start(): void {
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => this.onDocumentChange(e)),
      vscode.workspace.onDidCreateFiles((e) => this.onFilesCreated(e)),
      vscode.workspace.onDidDeleteFiles((e) => this.onFilesDeleted(e)),
    );
    log('FileChangeTracker started');
  }

  private onDocumentChange(e: vscode.TextDocumentChangeEvent): void {
    if (e.document.uri.scheme !== 'file') return;
    if (e.contentChanges.length === 0) return;

    const filePath = vscode.workspace.asRelativePath(e.document.uri);
    const existing = this.pendingChanges.get(filePath) ?? { added: 0, deleted: 0, size: 0 };

    for (const change of e.contentChanges) {
      const newLines = change.text.split('\n').length - 1;
      const deletedLines = change.range.end.line - change.range.start.line;
      existing.added += newLines;
      existing.deleted += deletedLines;
      existing.size += Math.abs(change.text.length - (change.rangeLength ?? 0));
    }

    this.pendingChanges.set(filePath, existing);
    this.debouncedFlush();
  }

  private flushPendingChanges(): void {
    for (const [filePath, changes] of this.pendingChanges) {
      const languageId = this.getLanguageId(filePath);
      this.sessionManager.addEvent(EventType.FILE_CHANGE, {
        filePath,
        languageId,
        linesAdded: changes.added,
        linesDeleted: changes.deleted,
        changeSize: changes.size,
      });
    }
    this.pendingChanges.clear();
  }

  private onFilesCreated(e: vscode.FileCreateEvent): void {
    for (const uri of e.files) {
      const filePath = vscode.workspace.asRelativePath(uri);
      this.sessionManager.addEvent(EventType.FILE_CREATE, {
        filePath,
        languageId: this.getLanguageId(filePath),
      });
    }
  }

  private onFilesDeleted(e: vscode.FileDeleteEvent): void {
    for (const uri of e.files) {
      const filePath = vscode.workspace.asRelativePath(uri);
      this.sessionManager.addEvent(EventType.FILE_DELETE, { filePath });
    }
  }

  private getLanguageId(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, string> = {
      ts: 'typescript', tsx: 'typescriptreact',
      js: 'javascript', jsx: 'javascriptreact',
      py: 'python', rs: 'rust', go: 'go',
      java: 'java', kt: 'kotlin', swift: 'swift',
      css: 'css', scss: 'scss', html: 'html',
      json: 'json', yaml: 'yaml', yml: 'yaml',
      md: 'markdown', sql: 'sql', sh: 'shellscript',
    };
    return map[ext] ?? ext;
  }

  flush(): void {
    this.debouncedFlush.cancel();
    this.flushPendingChanges();
  }

  dispose(): void {
    this.flush();
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }
}
