import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { shareRepo } from '../repositories/share.repo';
import { shareService } from '../services/share.service';
import { verificationService } from '../services/verification.service';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/error-handler';

export const shareRouter: RouterType = Router();

const CreateShareSchema = z.object({
  projectId: z.string().min(1),
  expiresAt: z.string().datetime().optional(),
});

// Create a share link
shareRouter.post('/create', validate(CreateShareSchema), (req: Request, res: Response) => {
  const { projectId, expiresAt } = req.body;
  const link = shareService.createShareLink(projectId, expiresAt);
  res.status(201).json(link);
});

// Get share links for a project
shareRouter.get('/project/:id', (req: Request, res: Response) => {
  const links = shareRepo.findByProject(req.params.id as string);
  res.json(links);
});

// Deactivate a share link
shareRouter.delete('/:id', (req: Request, res: Response) => {
  const deactivated = shareRepo.deactivate(req.params.id as string);
  if (!deactivated) {
    throw new AppError(404, 'Share link not found');
  }
  res.json({ message: 'Share link deactivated' });
});

// Public portfolio endpoint (no auth)
shareRouter.get('/public/:token', (req: Request, res: Response) => {
  const portfolio = shareService.getPublicPortfolio(req.params.token as string);
  res.json(portfolio);
});

// Verification endpoint
shareRouter.get('/verify/:projectId', (req: Request, res: Response) => {
  const result = verificationService.verify(req.params.projectId as string);
  res.json(result);
});
