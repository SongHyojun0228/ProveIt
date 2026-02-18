export interface PrivacySettings {
  trackFileContents: boolean;
  trackTerminalCommands: boolean;
  trackAICompletions: boolean;
  excludePatterns: string[];
}

export interface ProjectMeta {
  id: string;
  name: string;
  rootPath: string;
  createdAt: string;
  updatedAt: string;
  privacy: PrivacySettings;
  totalSessions: number;
}

export function createDefaultPrivacySettings(): PrivacySettings {
  return {
    trackFileContents: true,
    trackTerminalCommands: true,
    trackAICompletions: true,
    excludePatterns: ['.env', '.env.*', '*.pem', '*.key', '*secret*', '*credential*'],
  };
}
