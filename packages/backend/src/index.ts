import express, { type Express } from 'express';
import cors from 'cors';
import { config } from './config';
import { getDb, closeDb } from './db/connection';
import { sessionsRouter } from './routes/sessions';
import { projectsRouter } from './routes/projects';
import { insightsRouter } from './routes/insights';
import { shareRouter } from './routes/share';
import { errorHandler } from './middleware/error-handler';

const app: Express = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10mb' }));

// Initialize DB on startup
getDb();

app.use('/api/sessions', sessionsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/share', shareRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`ProveIt backend running on http://localhost:${config.port}`);
});

process.on('SIGINT', () => {
  closeDb();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  server.close();
  process.exit(0);
});

export default app;
