import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { SessionSchema } from '@proveit/shared';
import { sessionRepo } from '../repositories/session.repo';
import { hashchainRepo } from '../repositories/hashchain.repo';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/error-handler';
import { z } from 'zod';

export const sessionsRouter: RouterType = Router();

const UploadSchema = z.object({
  session: SessionSchema,
  projectName: z.string().min(1),
});

sessionsRouter.post('/upload', validate(UploadSchema), (req: Request, res: Response) => {
  const { session, projectName } = req.body;

  const existing = sessionRepo.findById(session.id);
  if (existing) {
    throw new AppError(409, `Session ${session.id} already exists`);
  }

  sessionRepo.insert(session, projectName);

  // Store hash chain entry if present
  if (session.hashChainEntry) {
    try {
      hashchainRepo.insertEntry(session.projectId, session.hashChainEntry, session.id);
    } catch (err) {
      // Duplicate entry (re-upload) — ignore
      console.warn('Hash chain entry already exists, skipping:', (err as Error).message);
    }
  }

  res.status(201).json({ id: session.id, message: 'Session uploaded' });
});

sessionsRouter.get('/', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  const sessions = sessionRepo.findAll(limit, offset);
  res.json(sessions);
});

sessionsRouter.get('/:id', (req: Request, res: Response) => {
  const session = sessionRepo.findById(req.params.id as string);
  if (!session) {
    throw new AppError(404, 'Session not found');
  }
  res.json(session);
});

sessionsRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = sessionRepo.delete(req.params.id as string);
  if (!deleted) {
    throw new AppError(404, 'Session not found');
  }
  res.json({ message: 'Session deleted' });
});
