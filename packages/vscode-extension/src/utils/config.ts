import * as vscode from 'vscode';

export interface ProveItConfig {
  enabled: boolean;
  idleTimeoutMinutes: number;
  sessionEndTimeoutMinutes: number;
  flushIntervalSeconds: number;
  excludePatterns: string[];
  aiToolDetection: boolean;
}

export function getConfig(): ProveItConfig {
  const config = vscode.workspace.getConfiguration('proveit');
  return {
    enabled: config.get<boolean>('enabled', true),
    idleTimeoutMinutes: config.get<number>('idleTimeoutMinutes', 5),
    sessionEndTimeoutMinutes: config.get<number>('sessionEndTimeoutMinutes', 30),
    flushIntervalSeconds: config.get<number>('flushIntervalSeconds', 60),
    excludePatterns: config.get<string[]>('excludePatterns', ['.env', '.env.*', '*.pem', '*.key']),
    aiToolDetection: config.get<boolean>('aiToolDetection', true),
  };
}
