import * as vscode from 'vscode';
import { EventType } from '@proveit/shared';
import { SessionManager } from '../session/SessionManager';
import { log } from '../utils/logger';

export class AICopilotTracker implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];
  private lastDocumentVersion = new Map<string, number>();

  constructor(private sessionManager: SessionManager) {}

  start(): void {
    // Register our command that intercepts Tab when inline suggestion is visible
    this.disposables.push(
      vscode.commands.registerCommand('proveit.acceptInlineSuggestion', () => {
        this.onAcceptSuggestion();
      }),
    );

    log('AICopilotTracker started');
  }

  private async onAcceptSuggestion(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const docUri = editor.document.uri.toString();
    const versionBefore = editor.document.version;
    this.lastDocumentVersion.set(docUri, versionBefore);

    // Accept the inline suggestion via the built-in command
    await vscode.commands.executeCommand('editor.action.inlineSuggest.commit');

    // Check if document changed (suggestion was actually applied)
    const versionAfter = editor.document.version;
    if (versionAfter > versionBefore) {
      const filePath = vscode.workspace.asRelativePath(editor.document.uri);
      const language = editor.document.languageId;

      this.sessionManager.addEvent(EventType.AI_COMPLETION_ACCEPTED, {
        completionLength: 0, // Can't reliably get length without diffing
        language,
        source: 'inline-suggestion',
      });

      log(`AI completion accepted in ${filePath}`);
    }
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
    this.lastDocumentVersion.clear();
  }
}
