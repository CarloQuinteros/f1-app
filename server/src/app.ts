import express, { Express } from 'express';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { sessionsRouter } from './routes/sessions';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.use('/api/health', healthRouter);
  app.use('/api/sessions', sessionsRouter);

  app.use(errorHandler);

  return app;
}
