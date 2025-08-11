import { NextFunction, Request, Response } from 'express';

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}
