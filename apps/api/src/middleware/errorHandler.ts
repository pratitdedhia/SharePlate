import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Do not expose stack trace or database secrets in production
  const responsePayload: Record<string, any> = {
    success: false,
    message,
  };

  if (config.nodeEnv === 'development') {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};
