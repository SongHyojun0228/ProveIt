import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { sessionRepo } from '../repositories/session.repo';
import { sessionAggregator } from '../services/session-aggregator';
import { AppError } from '../middleware/error-handler';

export const projectsRouter: RouterType = Router();

projectsRouter.get('/', (_req: Request, res: Response) => {
  const projects = sessionRepo.getProjectList();
  res.json(projects);
});

projectsRouter.get('/:id', (req: Request, res: Response) => {
  const projectId = req.params.id as string;
  const sessions = sessionRepo.findByProject(projectId);
  if (sessions.length === 0) {
    throw new AppError(404, 'Project not found');
  }

  const summary = sessionAggregator.aggregateProject(sessions);
  const projectName = (sessionRepo.getProjectList().find((p) => p.projectId === projectId))?.projectName || projectId;

  res.json({
    projectId,
    projectName,
    summary,
    sessionCount: sessions.length,
  });
});
