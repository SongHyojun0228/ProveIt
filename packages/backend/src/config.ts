import 'dotenv/config';
import path from 'path';

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  dbPath: process.env.DB_PATH || path.join(process.cwd(), 'proveit.db'),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  sessionModel: 'claude-3-5-haiku-latest' as const,
  projectModel: 'claude-sonnet-4-20250514' as const,
};
