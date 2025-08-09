import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper function to catch async errors and pass them to error handler
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;