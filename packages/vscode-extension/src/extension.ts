import * as vscode from 'vscode';
import { LocalStorageManager } from './storage/LocalStorageManager';
import { HashChain } from './storage/HashChain';
import { PrivacyFilter } from './privacy/PrivacyFilter';
import { ConsentManager } from './privacy/ConsentManager';
import { SessionManager } from './session/SessionManager';
import { FileChangeTracker } from './trackers/FileChangeTracker';
import { GitTracker } from './trackers/GitTracker';
import { AICopilotTracker } from './trackers/AICopilotTracker';
import { TerminalTracker } from './trackers/TerminalTracker';
import { ErrorTracker } from './trackers/ErrorTracker';
import { StatusBarManager } from './ui/StatusBarManager';
import { SessionTreeViewProvider } from './ui/TreeViewProvider';
import { registerCommands } from './ui/commands';
import { getConfig } from './utils/config';
import { log, logError, disposeLogger } from './utils/logger';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  log('ProveIt activating...');

  const config = getConfig();
  if (!config.enabled) {
    log('ProveIt is disabled in settings.');
    return;
  }

  // Check workspace
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    log('No workspace folder open. ProveIt requires a workspace.');
    return;
  }

  const projectRoot = workspaceFolders[0].uri.fsPath;

  // Consent
  const consentManager = new ConsentManager(context);
  const consented = await consentManager.requestConsent();
  if (!consented) {
    log('User did not consent. ProveIt will not track.');
    return;
  }

  try {
    // Storage
    const proveitDir = `${projectRoot}/.proveit`;
    const storage = new LocalStorageManager(projectRoot);
    await storage.initialize();

    const hashChain = new HashChain(proveitDir);
    await hashChain.load();

    // Privacy
    const privacyFilter = new PrivacyFilter();

    // Session
    const sessionManager = new SessionManager(storage, hashChain, privacyFilter);

    // UI
    const statusBar = new StatusBarManager();
    context.subscriptions.push(statusBar);

    sessionManager.onSessionStateChanged((state) => {
      statusBar.update(state);
    });

    // Tree view
    const treeViewProvider = new SessionTreeViewProvider(storage);
    const treeView = vscode.window.createTreeView('proveit.sessions', {
      treeDataProvider: treeViewProvider,
    });
    context.subscriptions.push(treeView);

    // Commands
    registerCommands(context, sessionManager, storage, hashChain, treeViewProvider);

    // Trackers
    const fileTracker = new FileChangeTracker(sessionManager);
    const gitTracker = new GitTracker(sessionManager);
    const aiTracker = new AICopilotTracker(sessionManager);
    const terminalTracker = new TerminalTracker(sessionManager);
    const errorTracker = new ErrorTracker(sessionManager);

    fileTracker.start();
    await gitTracker.start();
    aiTracker.start();
    terminalTracker.start();
    errorTracker.start();

    context.subscriptions.push(
      sessionManager,
      fileTracker,
      gitTracker,
      aiTracker,
      terminalTracker,
      errorTracker,
    );

    // Auto-start session
    await sessionManager.startSession();
    treeViewProvider.refresh();

    // Refresh tree when session state changes
    sessionManager.onSessionStateChanged(() => {
      treeViewProvider.refresh();
    });

    log('ProveIt activated successfully.');
  } catch (error) {
    logError('Failed to activate ProveIt', error);
    vscode.window.showErrorMessage('ProveIt: Failed to activate. Check Output panel for details.');
  }
}

export function deactivate(): void {
  log('ProveIt deactivating...');
  disposeLogger();
}
