import * as vscode from 'vscode';
import { LocalStorageManager } from '../storage/LocalStorageManager';
import { Session, SessionState } from '@proveit/shared';

export class SessionTreeItem extends vscode.TreeItem {
  constructor(
    public readonly sessionId: string,
    public readonly session: Session,
  ) {
    super(SessionTreeItem.getLabel(session), vscode.TreeItemCollapsibleState.None);
    this.description = SessionTreeItem.getDescription(session);
    this.iconPath = SessionTreeItem.getIcon(session);
    this.tooltip = SessionTreeItem.getTooltip(session);
  }

  private static getLabel(session: Session): string {
    const date = new Date(session.startTime);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private static getDescription(session: Session): string {
    const minutes = Math.round(session.duration.activeMs / 60_000);
    const events = session.events.length;
    return `${minutes}m active, ${events} events`;
  }

  private static getIcon(session: Session): vscode.ThemeIcon {
    switch (session.state) {
      case SessionState.ACTIVE:
        return new vscode.ThemeIcon('record', new vscode.ThemeColor('testing.runAction'));
      case SessionState.PAUSED:
        return new vscode.ThemeIcon('debug-pause');
      case SessionState.ENDED:
        return new vscode.ThemeIcon('check');
    }
  }

  private static getTooltip(session: Session): string {
    const m = session.metrics;
    return [
      `Session: ${session.id}`,
      `Files modified: ${m.filesModified}`,
      `Lines: +${m.linesAdded} -${m.linesDeleted}`,
      `Commits: ${m.commits}`,
      `AI completions: ${m.aiCompletions.accepted} accepted`,
      `Errors: ${m.errorsEncountered} occurred, ${m.errorsResolved} resolved`,
    ].join('\n');
  }
}

export class SessionTreeViewProvider implements vscode.TreeDataProvider<SessionTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SessionTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private storage: LocalStorageManager) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SessionTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<SessionTreeItem[]> {
    try {
      const sessionIds = await this.storage.listSessions();
      const items: SessionTreeItem[] = [];

      // Load up to 20 most recent sessions
      for (const id of sessionIds.slice(0, 20)) {
        try {
          const session = await this.storage.loadSession(id);
          items.push(new SessionTreeItem(id, session));
        } catch {
          // skip corrupt sessions
        }
      }

      return items;
    } catch {
      return [];
    }
  }

  dispose(): void {
    this._onDidChangeTreeData.dispose();
  }
}
