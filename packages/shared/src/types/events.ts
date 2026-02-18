export enum EventType {
  FILE_CREATE = 'file_create',
  FILE_CHANGE = 'file_change',
  FILE_DELETE = 'file_delete',
  GIT_COMMIT = 'git_commit',
  GIT_BRANCH_SWITCH = 'git_branch_switch',
  GIT_PUSH = 'git_push',
  AI_COMPLETION_ACCEPTED = 'ai_completion_accepted',
  AI_COMPLETION_REJECTED = 'ai_completion_rejected',
  AI_COMPLETION_MODIFIED = 'ai_completion_modified',
  TERMINAL_COMMAND = 'terminal_command',
  ERROR_OCCURRED = 'error_occurred',
  ERROR_RESOLVED = 'error_resolved',
  SESSION_START = 'session_start',
  SESSION_PAUSE = 'session_pause',
  SESSION_RESUME = 'session_resume',
}

export interface FileChangeData {
  filePath: string;
  languageId: string;
  linesAdded: number;
  linesDeleted: number;
  changeSize: number;
}

export interface FileCreateData {
  filePath: string;
  languageId: string;
}

export interface FileDeleteData {
  filePath: string;
}

export interface GitCommitData {
  hash: string;
  message: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
  branch: string;
}

export interface GitBranchSwitchData {
  fromBranch: string;
  toBranch: string;
}

export interface GitPushData {
  branch: string;
  remote: string;
  commits: number;
}

export interface AICompletionData {
  completionLength: number;
  language: string;
  source: string;
}

export interface TerminalCommandData {
  command: string;
  category: TerminalCommandCategory;
  exitCode?: number;
}

export enum TerminalCommandCategory {
  BUILD = 'build',
  TEST = 'test',
  INSTALL = 'install',
  GIT = 'git',
  DEBUG = 'debug',
  RUN = 'run',
  OTHER = 'other',
}

export interface ErrorOccurredData {
  filePath: string;
  message: string;
  severity: 'error' | 'warning';
  source?: string;
  code?: string;
}

export interface ErrorResolvedData {
  filePath: string;
  message: string;
  resolutionTimeMs: number;
}

export interface SessionEventData {
  reason?: string;
}

export type EventData =
  | FileChangeData
  | FileCreateData
  | FileDeleteData
  | GitCommitData
  | GitBranchSwitchData
  | GitPushData
  | AICompletionData
  | TerminalCommandData
  | ErrorOccurredData
  | ErrorResolvedData
  | SessionEventData;

export interface ActivityEvent {
  id: string;
  type: EventType;
  timestamp: string;
  data: EventData;
}
