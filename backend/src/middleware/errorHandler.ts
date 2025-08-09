import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { log } from '@/utils/logger';
import { AppError } from '@/utils/errors';

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    details?: any;
  };
  requestId?: string;
}

// Handle Prisma errors
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined;
      const fieldName = field ? field[0] : 'field';
      return new AppError(
        `A record with this ${fieldName} already exists`,
        409,
        'DUPLICATE_ENTRY'
      );
    
    case 'P2025':
      // Record not found
      return new AppError(
        'The requested record was not found',
        404,
        'RECORD_NOT_FOUND'
      );
    
    case 'P2003':
      // Foreign key constraint violation
      return new AppError(
        'Cannot delete record due to related data',
        409,
        'FOREIGN_KEY_CONSTRAINT'
      );
    
    case 'P2014':
      // Required relation violation
      return new AppError(
        'The change you are trying to make would violate the required relation',
        400,
        'REQUIRED_RELATION_VIOLATION'
      );
    
    case 'P2021':
      // Table does not exist
      return new AppError(
        'Database table does not exist',
        500,
        'TABLE_NOT_FOUND'
      );
    
    case 'P2022':
      // Column does not exist
      return new AppError(
        'Database column does not exist',
        500,
        'COLUMN_NOT_FOUND'
      );
    
    default:
      return new AppError(
        'Database operation failed',
        500,
        'DATABASE_ERROR'
      );
  }
};

// Handle Zod validation errors
const handleZodError = (error: ZodError): AppError => {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return new AppError(
    'Validation failed',
    400,
    'VALIDATION_ERROR'
  );
};

// Handle JWT errors
const handleJWTError = (error: Error): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AppError('Token has expired', 401, 'TOKEN_EXPIRED');
  }
  
  return new AppError('Authentication failed', 401, 'AUTH_ERROR');
};

// Handle Multer errors
const handleMulterError = (error: any): AppError => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new AppError(
      'File size too large',
      413,
      'FILE_TOO_LARGE'
    );
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new AppError(
      'Too many files uploaded',
      413,
      'TOO_MANY_FILES'
    );
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError(
      'Unexpected file field',
      400,
      'UNEXPECTED_FILE'
    );
  }
  
  return new AppError(
    'File upload failed',
    400,
    'UPLOAD_ERROR'
  );
};

// Send error response in development
const sendErrorDev = (err: AppError, req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      details: {
        stack: err.stack,
        name: err.name
      }
    },
    requestId: req.headers['x-request-id'] as string
  };

  res.status(err.statusCode).json(errorResponse);
};

// Send error response in production
const sendErrorProd = (err: AppError, req: Request, res: Response): void => {
  // Only send operational errors to client in production
  if (err.isOperational) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
      },
      requestId: req.headers['x-request-id'] as string
    };

    res.status(err.statusCode).json(errorResponse);
  } else {
    // Programming or other unknown error: don't leak error details
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message: 'Something went wrong!',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
      },
      requestId: req.headers['x-request-id'] as string
    };

    res.status(500).json(errorResponse);
  }
};

// Main error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error
  log.error('Error occurred', err, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    requestId: req.headers['x-request-id']
  });

  // Handle specific error types
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    error = new AppError('Database operation failed', 500, 'DATABASE_ERROR');
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    error = new AppError('Database connection failed', 500, 'DATABASE_CONNECTION_ERROR');
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    error = new AppError('Database initialization failed', 500, 'DATABASE_INIT_ERROR');
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = new AppError('Database validation failed', 400, 'DATABASE_VALIDATION_ERROR');
  } else if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  } else if (err.name === 'MulterError') {
    error = handleMulterError(err);
  } else if (err.name === 'ValidationError') {
    error = new AppError(err.message, 400, 'VALIDATION_ERROR');
  } else if (err.name === 'CastError') {
    error = new AppError('Invalid data format', 400, 'INVALID_DATA_FORMAT');
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    error = new AppError('Invalid JSON format', 400, 'INVALID_JSON');
  } else if (!error.statusCode) {
    // Unknown error
    error = new AppError('Internal server error', 500, 'INTERNAL_ERROR');
    error.isOperational = false;
  }

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create error helper functions
export const createError = {
  badRequest: (message: string = 'Bad request', code?: string) => 
    new AppError(message, 400, code),
  
  unauthorized: (message: string = 'Unauthorized', code?: string) => 
    new AppError(message, 401, code),
  
  forbidden: (message: string = 'Forbidden', code?: string) => 
    new AppError(message, 403, code),
  
  notFound: (message: string = 'Not found', code?: string) => 
    new AppError(message, 404, code),
  
  conflict: (message: string = 'Conflict', code?: string) => 
    new AppError(message, 409, code),
  
  unprocessableEntity: (message: string = 'Unprocessable entity', code?: string) => 
    new AppError(message, 422, code),
  
  tooManyRequests: (message: string = 'Too many requests', code?: string) => 
    new AppError(message, 429, code),
  
  internal: (message: string = 'Internal server error', code?: string) => 
    new AppError(message, 500, code),
  
  notImplemented: (message: string = 'Not implemented', code?: string) => 
    new AppError(message, 501, code),
  
  serviceUnavailable: (message: string = 'Service unavailable', code?: string) => 
    new AppError(message, 503, code)
};