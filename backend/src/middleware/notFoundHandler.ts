import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/middleware/errorHandler';

/**
 * 404 Not Found Handler Middleware
 * Handles requests to non-existent routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  
  next(error);
};

export default notFoundHandler;