import * as vscode from 'vscode';
import { SessionManager } from '../session/SessionManager';
import { LocalStorageManager } from '../storage/LocalStorageManager';
import { HashChain } from '../storage/HashChain';
import { SessionTreeViewProvider } from './TreeViewProvider';
import { TrustGrade, type Session } from '@proveit/shared';

export function registerCommands(
  context: vscode.ExtensionContext,
  sessionManager: SessionManager,
  storage: LocalStorageManager,
  hashChain: HashChain,
  treeViewProvider: SessionTreeViewProvider,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('proveit.startSession', async () => {
      await sessionManager.startSession();
      treeViewProvider.refresh();
      vscode.window.showInformationMessage('ProveIt: Session started.');
    }),

    vscode.commands.registerCommand('proveit.pauseSession', () => {
      sessionManager.pauseSession('manual');
      vscode.window.showInformationMessage('ProveIt: Session paused.');
    }),

    vscode.commands.registerCommand('proveit.resumeSession', () => {
      sessionManager.resumeSession('manual');
      vscode.window.showInformationMessage('ProveIt: Session resumed.');
    }),

    vscode.commands.registerCommand('proveit.endSession', async () => {
      const session = await sessionManager.endSession('manual');
      treeViewProvider.refresh();
      if (session) {
        const mins = Math.round(session.duration.activeMs / 60_000);
        vscode.window.showInformationMessage(
          `ProveIt: Session ended. ${mins}m active, ${session.events.length} events recorded.`,
        );
      }
    }),

    vscode.commands.registerCommand('proveit.viewSessions', () => {
      vscode.commands.executeCommand('proveit.sessions.focus');
    }),

    vscode.commands.registerCommand('proveit.verifyChain', () => {
      const result = hashChain.verify();
      const icon = result.grade === TrustGrade.HIGH ? '🟢' :
                   result.grade === TrustGrade.MEDIUM ? '🟡' : '🔴';
      vscode.window.showInformationMessage(
        `ProveIt Chain Verification ${icon}\n${result.message}`,
      );
    }),

    vscode.commands.registerCommand('proveit.showDashboard', () => {
      const state = sessionManager.getState();
      if (state === null) {
        vscode.commands.executeCommand('proveit.startSession');
      } else {
        vscode.commands.executeCommand('proveit.sessions.focus');
      }
    }),

    vscode.commands.registerCommand('proveit.uploadSession', async () => {
      const sessionIds = await storage.listSessions();
      if (sessionIds.length === 0) {
        vscode.window.showWarningMessage('ProveIt: No sessions to upload.');
        return;
      }

      const items = sessionIds.map((id) => ({ label: id }));
      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a session to upload',
        canPickMany: false,
      });
      if (!selected) return;

      try {
        const session = await storage.loadSession(selected.label);
        const meta = await storage.getProjectMeta();

        const backendUrl = vscode.workspace
          .getConfiguration('proveit')
          .get<string>('backendUrl', 'http://localhost:4000');

        const response = await fetch(`${backendUrl}/api/sessions/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session, projectName: meta.name }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error || `HTTP ${response.status}`);
        }

        vscode.window.showInformationMessage(
          `ProveIt: Session ${selected.label} uploaded successfully.`,
        );
      } catch (err) {
        vscode.window.showErrorMessage(
          `ProveIt: Upload failed — ${(err as Error).message}`,
        );
      }
    }),
  );
}
