import { z } from 'zod';
import { EventType, TerminalCommandCategory } from '../types/events';
import { SessionState } from '../types/session';
import { TrustGrade } from '../types/verification';

export const FileChangeDataSchema = z.object({
  filePath: z.string(),
  languageId: z.string(),
  linesAdded: z.number().int().min(0),
  linesDeleted: z.number().int().min(0),
  changeSize: z.number().int().min(0),
});

export const FileCreateDataSchema = z.object({
  filePath: z.string(),
  languageId: z.string(),
});

export const FileDeleteDataSchema = z.object({
  filePath: z.string(),
});

export const GitCommitDataSchema = z.object({
  hash: z.string(),
  message: z.string(),
  filesChanged: z.number().int().min(0),
  insertions: z.number().int().min(0),
  deletions: z.number().int().min(0),
  branch: z.string(),
});

export const GitBranchSwitchDataSchema = z.object({
  fromBranch: z.string(),
  toBranch: z.string(),
});

export const GitPushDataSchema = z.object({
  branch: z.string(),
  remote: z.string(),
  commits: z.number().int().min(0),
});

export const AICompletionDataSchema = z.object({
  completionLength: z.number().int().min(0),
  language: z.string(),
  source: z.string(),
});

export const TerminalCommandDataSchema = z.object({
  command: z.string(),
  category: z.nativeEnum(TerminalCommandCategory),
  exitCode: z.number().int().optional(),
});

export const ErrorOccurredDataSchema = z.object({
  filePath: z.string(),
  message: z.string(),
  severity: z.enum(['error', 'warning']),
  source: z.string().optional(),
  code: z.string().optional(),
});

export const ErrorResolvedDataSchema = z.object({
  filePath: z.string(),
  message: z.string(),
  resolutionTimeMs: z.number().min(0),
});

export const SessionEventDataSchema = z.object({
  reason: z.string().optional(),
});

export const AIToolDetectedDataSchema = z.object({
  toolName: z.enum(['claude-code', 'cursor-agent', 'aider', 'copilot-cli', 'unknown']),
  processName: z.string(),
  pid: z.number().int().optional(),
});

export const AIToolEditDataSchema = z.object({
  toolName: z.enum(['claude-code', 'cursor-agent', 'aider', 'copilot-cli', 'unknown']),
  filePath: z.string(),
  languageId: z.string(),
  linesAdded: z.number().int().min(0),
  linesDeleted: z.number().int().min(0),
  changeSize: z.number().int().min(0),
  detectionMethod: z.enum(['process', 'velocity', 'external_change', 'combined']),
  confidence: z.number().min(0).max(1),
});

export const AIToolSessionEndDataSchema = z.object({
  toolName: z.enum(['claude-code', 'cursor-agent', 'aider', 'copilot-cli', 'unknown']),
  durationMs: z.number().min(0),
  filesEdited: z.number().int().min(0),
  totalLinesChanged: z.number().int().min(0),
});

export const AIToolMetricsSchema = z.object({
  filesEdited: z.number().int().min(0),
  linesAdded: z.number().int().min(0),
  linesDeleted: z.number().int().min(0),
  toolBreakdown: z.record(z.string(), z.number().int().min(0)),
});

export const ActivityEventSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(EventType),
  timestamp: z.string().datetime(),
  data: z.record(z.unknown()),
});

export const AICompletionMetricsSchema = z.object({
  accepted: z.number().int().min(0),
  rejected: z.number().int().min(0),
  modified: z.number().int().min(0),
  acceptRate: z.number().min(0).max(1),
});

export const SessionMetricsSchema = z.object({
  filesModified: z.number().int().min(0),
  linesAdded: z.number().int().min(0),
  linesDeleted: z.number().int().min(0),
  commits: z.number().int().min(0),
  terminalCommands: z.number().int().min(0),
  errorsEncountered: z.number().int().min(0),
  errorsResolved: z.number().int().min(0),
  aiCompletions: AICompletionMetricsSchema,
  aiToolEdits: AIToolMetricsSchema.optional(),
});

export const SessionDurationSchema = z.object({
  totalMs: z.number().min(0),
  activeMs: z.number().min(0),
  idleMs: z.number().min(0),
});

export const HashEntrySchema = z.object({
  index: z.number().int().min(0),
  hash: z.string(),
  previousHash: z.string(),
  timestamp: z.string().datetime(),
  dataHash: z.string(),
});

export const SessionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  state: z.nativeEnum(SessionState),
  duration: SessionDurationSchema,
  metrics: SessionMetricsSchema,
  events: z.array(ActivityEventSchema),
  hashChainEntry: HashEntrySchema.optional(),
});

export const PrivacySettingsSchema = z.object({
  trackFileContents: z.boolean(),
  trackTerminalCommands: z.boolean(),
  trackAICompletions: z.boolean(),
  excludePatterns: z.array(z.string()),
});

export const ProjectMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  rootPath: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  privacy: PrivacySettingsSchema,
  totalSessions: z.number().int().min(0),
});

export const VerificationResultSchema = z.object({
  valid: z.boolean(),
  grade: z.nativeEnum(TrustGrade),
  chainLength: z.number().int().min(0),
  brokenAt: z.number().int().optional(),
  message: z.string(),
});

// Insight schemas

export const InsightStatusSchema = z.enum(['pending', 'generating', 'completed', 'failed']);

export const SessionHighlightSchema = z.object({
  type: z.enum(['decision', 'debugging', 'refactor', 'breakthrough', 'ai_usage']),
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  significance: z.enum(['high', 'medium', 'low']),
});

export const KeyDecisionSchema = z.object({
  description: z.string(),
  alternatives: z.array(z.string()),
  reasoning: z.string(),
  timestamp: z.string(),
});

export const SessionInsightSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  projectId: z.string(),
  status: InsightStatusSchema,
  createdAt: z.string(),
  summary: z.string(),
  highlights: z.array(SessionHighlightSchema),
  aiUsageRate: z.number().min(0).max(1),
  keyDecisions: z.array(KeyDecisionSchema),
  techStack: z.array(z.string()),
  error: z.string().optional(),
});

export const CapabilityTagSchema = z.object({
  name: z.string(),
  category: z.enum(['language', 'framework', 'tool', 'skill', 'pattern']),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  evidence: z.string(),
});

export const ProjectSummarySchema = z.object({
  totalSessions: z.number().int().min(0),
  totalActiveTimeMs: z.number().min(0),
  totalEvents: z.number().int().min(0),
  avgSessionLengthMs: z.number().min(0),
  aiUsageRate: z.number().min(0).max(1),
  linesAdded: z.number().int().min(0),
  linesDeleted: z.number().int().min(0),
  commits: z.number().int().min(0),
  errorsEncountered: z.number().int().min(0),
  errorsResolved: z.number().int().min(0),
});

export const ProjectInsightSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  status: InsightStatusSchema,
  createdAt: z.string(),
  summary: ProjectSummarySchema,
  narrative: z.string(),
  capabilities: z.array(CapabilityTagSchema),
  strengths: z.array(z.string()),
  growthAreas: z.array(z.string()),
  workStyle: z.string(),
  error: z.string().optional(),
});

// Share schemas

export const ShareLinkSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  token: z.string(),
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  isActive: z.boolean(),
});

export const PublicPortfolioSchema = z.object({
  projectName: z.string(),
  projectId: z.string(),
  insight: ProjectInsightSchema,
  verification: VerificationResultSchema,
  sharedAt: z.string(),
});
