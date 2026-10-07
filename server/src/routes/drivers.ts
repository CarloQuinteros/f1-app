import { Router, Request, Response, NextFunction } from 'express';
import { promises as fs } from 'fs';
import { join } from 'path';
import { fetchDrivers } from '../services/openf1Client';
import { ApiError } from '../middleware/errorHandler';

export const driversRouter = Router();

interface LogEntry {
  timestamp: string;
  url: string;
  status: number | null;
  driversCount: number | null;
  error?: string;
  result: 'OK' | 'ERROR';
}

function formatTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function logDriversFetch(entry: LogEntry): Promise<void> {
  try {
    const logsDir = join(process.cwd(), 'logs');

    try {
      await fs.mkdir(logsDir, { recursive: true });
    } catch {
      // Directory might already exist or we might not have permission
    }

    const logFile = join(logsDir, 'fetchAPI.log');

    const logLine = entry.error
      ? `[${entry.timestamp}] URL: ${entry.url} | Status: ${entry.status} | Error: ${entry.error} | Result: ${entry.result}`
      : `[${entry.timestamp}] URL: ${entry.url} | Status: ${entry.status} | Drivers: ${entry.driversCount} | Result: ${entry.result}`;

    await fs.appendFile(logFile, `${logLine}\n`);
  } catch {
    // Silently handle logging errors to prevent API crashes
  }
}

driversRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    const sessionKey = req.query.sessionKey ? (req.query.sessionKey as string) : undefined;
    const baseURL = process.env.OPENF1_BASE_URL || 'https://api.openf1.org/v1';
    const urlParams = sessionKey ? `?session_key=${sessionKey}` : '';
    const url = `${baseURL}/drivers${urlParams}`;

    try {
      const drivers = await fetchDrivers(sessionKey);

      await logDriversFetch({
        timestamp: formatTimestamp(),
        url,
        status: 200,
        driversCount: drivers.length,
        result: 'OK',
      });

      res.json(drivers);
    } catch (error) {
      const apiError = error as ApiError;
      apiError.status = 502;

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await logDriversFetch({
        timestamp: formatTimestamp(),
        url,
        status: 502,
        driversCount: null,
        error: errorMessage,
        result: 'ERROR',
      });

      next(apiError);
    }
  },
);
