export type InsightStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface SessionHighlight {
  type: 'decision' | 'debugging' | 'refactor' | 'breakthrough' | 'ai_usage';
  title: string;
  description: string;
  timestamp: string;
  significance: 'high' | 'medium' | 'low';
}

export interface KeyDecision {
  description: string;
  alternatives: string[];
  reasoning: string;
  timestamp: string;
}

export interface SessionInsight {
  id: string;
  sessionId: string;
  projectId: string;
  status: InsightStatus;
  createdAt: string;
  summary: string;
  highlights: SessionHighlight[];
  aiUsageRate: number;
  keyDecisions: KeyDecision[];
  techStack: string[];
  error?: string;
}

export interface CapabilityTag {
  name: string;
  category: 'language' | 'framework' | 'tool' | 'skill' | 'pattern';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evidence: string;
}

export interface ProjectSummary {
  totalSessions: number;
  totalActiveTimeMs: number;
  totalEvents: number;
  avgSessionLengthMs: number;
  aiUsageRate: number;
  linesAdded: number;
  linesDeleted: number;
  commits: number;
  errorsEncountered: number;
  errorsResolved: number;
}

export interface ProjectInsight {
  id: string;
  projectId: string;
  status: InsightStatus;
  createdAt: string;
  summary: ProjectSummary;
  narrative: string;
  capabilities: CapabilityTag[];
  strengths: string[];
  growthAreas: string[];
  workStyle: string;
  error?: string;
}
