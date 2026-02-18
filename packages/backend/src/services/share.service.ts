import crypto from 'crypto';
import { generateId, nowISO, type ShareLink, type PublicPortfolio } from '@proveit/shared';
import { shareRepo } from '../repositories/share.repo';
import { insightRepo } from '../repositories/insight.repo';
import { sessionRepo } from '../repositories/session.repo';
import { verificationService } from './verification.service';
import { AppError } from '../middleware/error-handler';

export const shareService = {
  createShareLink(projectId: string, expiresAt?: string): ShareLink {
    // Verify project insight exists before allowing sharing
    const insight = insightRepo.findProjectInsight(projectId);
    if (!insight || insight.status !== 'completed') {
      throw new AppError(400, 'Project insight must be generated before sharing');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const link: ShareLink = {
      id: generateId('shr'),
      projectId,
      token,
      createdAt: nowISO(),
      expiresAt: expiresAt || null,
      isActive: true,
    };

    shareRepo.insert(link);
    return link;
  },

  getPublicPortfolio(token: string): PublicPortfolio {
    const link = shareRepo.findByToken(token);
    if (!link) {
      throw new AppError(404, 'Share link not found or inactive');
    }

    // Check expiration
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      throw new AppError(410, 'Share link has expired');
    }

    const insight = insightRepo.findProjectInsight(link.projectId);
    if (!insight) {
      throw new AppError(404, 'Project insight not found');
    }

    const verification = verificationService.verify(link.projectId);

    // Get project name from sessions
    const projects = sessionRepo.getProjectList();
    const project = projects.find((p) => p.projectId === link.projectId);

    return {
      projectName: project?.projectName || 'Unknown Project',
      projectId: link.projectId,
      insight,
      verification,
      sharedAt: link.createdAt,
    };
  },
};
