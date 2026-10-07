import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
}

export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';

  console.error(`[${status}] ${message}`);

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
}
