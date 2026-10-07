import { Router, Request, Response, NextFunction } from 'express';
import { fetchSessions } from '../services/openf1Client';
import { ApiError } from '../middleware/errorHandler';

export const sessionsRouter = Router();

sessionsRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const sessions = await fetchSessions(year);
      res.json(sessions);
    } catch (error) {
      const apiError = error as ApiError;
      apiError.status = 502;
      next(apiError);
    }
  },
);
