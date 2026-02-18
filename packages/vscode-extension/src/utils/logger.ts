import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | undefined;

export function getLogger(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('ProveIt');
  }
  return outputChannel;
}

export function log(message: string): void {
  getLogger().appendLine(`[${new Date().toISOString()}] ${message}`);
}

export function logError(message: string, error?: unknown): void {
  const errorMsg = error instanceof Error ? error.message : String(error ?? '');
  log(`ERROR: ${message}${errorMsg ? ` - ${errorMsg}` : ''}`);
}

export function disposeLogger(): void {
  outputChannel?.dispose();
  outputChannel = undefined;
}
