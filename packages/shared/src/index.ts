export {
  EventType,
  TerminalCommandCategory,
  type ActivityEvent,
  type EventData,
  type FileChangeData,
  type FileCreateData,
  type FileDeleteData,
  type GitCommitData,
  type GitBranchSwitchData,
  type GitPushData,
  type AICompletionData,
  type TerminalCommandData,
  type ErrorOccurredData,
  type ErrorResolvedData,
  type SessionEventData,
} from './types/events';

export {
  SessionState,
  createEmptyMetrics,
  type Session,
  type SessionDuration,
  type SessionMetrics,
  type AICompletionMetrics,
} from './types/session';

export {
  createDefaultPrivacySettings,
  type ProjectMeta,
  type PrivacySettings,
} from './types/project';

export {
  TrustGrade,
  type HashEntry,
  type VerificationResult,
} from './types/verification';

export {
  type InsightStatus,
  type SessionHighlight,
  type KeyDecision,
  type SessionInsight,
  type CapabilityTag,
  type ProjectSummary,
  type ProjectInsight,
} from './types/insight';

export { type ShareLink, type PublicPortfolio } from './types/share';

export * from './schemas/validators';
export { sha256, computeChainHash } from './utils/hash';
export { nowISO, elapsedMs, generateId } from './utils/time';
