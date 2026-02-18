import { Router, type Request, type Response, type NextFunction } from 'express';
import type { Router as RouterType } from 'express';
import { sessionRepo } from '../repositories/session.repo';
import { insightRepo } from '../repositories/insight.repo';
import { insightGenerator } from '../services/insight-generator';
import { sessionAggregator } from '../services/session-aggregator';
import { AppError } from '../middleware/error-handler';
import { generateId, nowISO } from '@proveit/shared';

export const insightsRouter: RouterType = Router();

// Generate session insight
insightsRouter.post('/session/:id/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.id as string;
    const session = sessionRepo.findById(sessionId);
    if (!session) {
      throw new AppError(404, 'Session not found');
    }

    // Mark as generating
    insightRepo.upsertSessionInsight({
      id: generateId('si'),
      sessionId: session.id,
      projectId: session.projectId,
      status: 'generating',
      createdAt: nowISO(),
      summary: '',
      highlights: [],
      aiUsageRate: 0,
      keyDecisions: [],
      techStack: [],
    });

    const insight = await insightGenerator.generateSessionInsight(session);
    insightRepo.upsertSessionInsight(insight);

    res.json(insight);
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    // Store failed state
    const sessionId = req.params.id as string;
    const session = sessionRepo.findById(sessionId);
    if (session) {
      insightRepo.upsertSessionInsight({
        id: generateId('si'),
        sessionId: session.id,
        projectId: session.projectId,
        status: 'failed',
        createdAt: nowISO(),
        summary: '',
        highlights: [],
        aiUsageRate: 0,
        keyDecisions: [],
        techStack: [],
        error: (err as Error).message,
      });
    }
    next(err);
  }
});

// Get session insight
insightsRouter.get('/session/:id', (req: Request, res: Response) => {
  const insight = insightRepo.findSessionInsight(req.params.id as string);
  if (!insight) {
    throw new AppError(404, 'Session insight not found');
  }
  res.json(insight);
});

// Generate project insight
insightsRouter.post('/project/:id/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const sessions = sessionRepo.findByProject(projectId);
    if (sessions.length === 0) {
      throw new AppError(404, 'No sessions found for project');
    }

    const projectList = sessionRepo.getProjectList();
    const projectName = projectList.find((p) => p.projectId === projectId)?.projectName || projectId;
    const summary = sessionAggregator.aggregateProject(sessions);
    const sessionInsights = insightRepo.findSessionInsightsByProject(projectId);

    // Mark as generating
    insightRepo.upsertProjectInsight({
      id: generateId('pi'),
      projectId,
      status: 'generating',
      createdAt: nowISO(),
      summary,
      narrative: '',
      capabilities: [],
      strengths: [],
      growthAreas: [],
      workStyle: '',
    });

    const insight = await insightGenerator.generateProjectInsight(
      projectId,
      projectName,
      summary,
      sessions,
      sessionInsights,
    );
    insightRepo.upsertProjectInsight(insight);

    res.json(insight);
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    const projectId = req.params.id as string;
    insightRepo.upsertProjectInsight({
      id: generateId('pi'),
      projectId,
      status: 'failed',
      createdAt: nowISO(),
      summary: {
        totalSessions: 0,
        totalActiveTimeMs: 0,
        totalEvents: 0,
        avgSessionLengthMs: 0,
        aiUsageRate: 0,
        linesAdded: 0,
        linesDeleted: 0,
        commits: 0,
        errorsEncountered: 0,
        errorsResolved: 0,
      },
      narrative: '',
      capabilities: [],
      strengths: [],
      growthAreas: [],
      workStyle: '',
      error: (err as Error).message,
    });
    next(err);
  }
});

// Get project insight
insightsRouter.get('/project/:id', (req: Request, res: Response) => {
  const insight = insightRepo.findProjectInsight(req.params.id as string);
  if (!insight) {
    throw new AppError(404, 'Project insight not found');
  }
  res.json(insight);
});
