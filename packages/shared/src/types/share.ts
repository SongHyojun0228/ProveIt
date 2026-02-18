import type { ProjectInsight } from './insight';
import type { VerificationResult } from './verification';

export interface ShareLink {
  id: string;
  projectId: string;
  token: string;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export interface PublicPortfolio {
  projectName: string;
  projectId: string;
  insight: ProjectInsight;
  verification: VerificationResult;
  sharedAt: string;
}
