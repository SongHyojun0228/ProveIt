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
  AI_TOOL_DETECTED = 'ai_tool_detected',
  AI_TOOL_EDIT = 'ai_tool_edit',
  AI_TOOL_SESSION_END = 'ai_tool_session_end',
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

export type AIToolName = 'claude-code' | 'cursor-agent' | 'aider' | 'copilot-cli' | 'unknown';
export type AIToolDetectionMethod = 'process' | 'velocity' | 'external_change' | 'combined';

export interface AIToolDetectedData {
  toolName: AIToolName;
  processName: string;
  pid?: number;
}

export interface AIToolEditData {
  toolName: AIToolName;
  filePath: string;
  languageId: string;
  linesAdded: number;
  linesDeleted: number;
  changeSize: number;
  detectionMethod: AIToolDetectionMethod;
  confidence: number;
}

export interface AIToolSessionEndData {
  toolName: AIToolName;
  durationMs: number;
  filesEdited: number;
  totalLinesChanged: number;
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
  | SessionEventData
  | AIToolDetectedData
  | AIToolEditData
  | AIToolSessionEndData;

export interface ActivityEvent {
  id: string;
  type: EventType;
  timestamp: string;
  data: EventData;
}
