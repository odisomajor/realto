import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '../types/auth';
import { JWTPayload, AuthMiddlewareOptions } from '@/types/auth';
import authConfig from '@/config/auth';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { cache } from '@/config/database';

const prisma = new PrismaClient();

// Express Request interface is extended in types/express.d.ts

/**
 * Extract token from Authorization header
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Check if token is blacklisted
 */
const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const blacklistKey = `blacklist:${token}`;
  const isBlacklisted = await cache.exists(blacklistKey);
  return isBlacklisted === 1;
};

/**
 * Blacklist a token
 */
export const blacklistToken = async (token: string, expiresAt: Date): Promise<void> => {
  const blacklistKey = `blacklist:${token}`;
  const ttl = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  
  if (ttl > 0) {
    await cache.set(blacklistKey, '1', ttl);
  }
};

/**
 * Basic authentication middleware
 * Validates JWT token and attaches user info to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    // Check if token is blacklisted
    if (await isTokenBlacklisted(token)) {
      throw new AppError('Token has been revoked', 401);
    }

    // Verify JWT token
    const payload = jwt.verify(token, authConfig.jwt.secret) as JWTPayload;

    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled', 403);
    }

    // Attach user info to request
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', { error: error.message });
      return next(new AppError('Invalid token', 401));
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired JWT token', { error: error.message });
      return next(new AppError('Token expired', 401));
    }

    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present and valid, but doesn't require it
 */
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next();
    }

    // Check if token is blacklisted
    if (await isTokenBlacklisted(token)) {
      return next();
    }

    // Verify JWT token
    const payload = jwt.verify(token, authConfig.jwt.secret) as JWTPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    });

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};

/**
 * Role-based authorization middleware factory
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path
      });
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Email verification requirement middleware
 */
export const requireEmailVerification = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!req.user.emailVerified) {
    return next(new AppError('Email verification required', 403));
  }

  next();
};

/**
 * Phone verification requirement middleware
 */
export const requirePhoneVerification = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!req.user.phoneVerified) {
    return next(new AppError('Phone verification required', 403));
  }

  next();
};

/**
 * Advanced authentication middleware with options
 */
export const authenticateWithOptions = (options: AuthMiddlewareOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // First, authenticate the user
      await authenticate(req, res, () => {});

      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // Check email verification if required
      if (options.requireVerification && !req.user.emailVerified) {
        throw new AppError('Email verification required', 403);
      }

      // Check role authorization if specified
      if (options.allowedRoles && !options.allowedRoles.includes(req.user.role)) {
        logger.warn('Unauthorized access attempt', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: options.allowedRoles,
          path: req.path
        });
        throw new AppError('Insufficient permissions', 403);
      }

      // Check if user must be active (default: true)
      if (options.requireActive !== false && !req.user.isActive) {
        throw new AppError('Account is disabled', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = authorize([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

/**
 * Super admin only middleware
 */
export const superAdminOnly = authorize([UserRole.SUPER_ADMIN]);

/**
 * Agent or admin middleware
 */
export const agentOrAdmin = authorize([UserRole.AGENT, UserRole.ADMIN, UserRole.SUPER_ADMIN]);

/**
 * Resource ownership middleware factory
 * Checks if the authenticated user owns the resource or has admin privileges
 */
export const requireOwnership = (resourceIdParam: string = 'id', userIdField: string = 'userId') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        throw new AppError('Resource ID is required', 400);
      }

      // Admin and super admin can access any resource
      if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role)) {
        return next();
      }

      // For other users, check ownership based on the route
      let isOwner = false;

      // Check different resource types
      if (req.route.path.includes('/users/')) {
        // User resource - check if user is accessing their own profile
        isOwner = resourceId === req.user.id;
      } else if (req.route.path.includes('/properties/')) {
        // Property resource - check if user owns the property
        const property = await prisma.property.findUnique({
          where: { id: resourceId },
          select: { ownerId: true, agentId: true }
        });
        
        if (property) {
          isOwner = property.ownerId === req.user.id || property.agentId === req.user.id;
        }
      } else if (req.route.path.includes('/inquiries/')) {
        // Inquiry resource - check if user created the inquiry
        const inquiry = await prisma.inquiry.findUnique({
          where: { id: resourceId },
          select: { userId: true }
        });
        
        if (inquiry) {
          isOwner = inquiry.userId === req.user.id;
        }
      }

      if (!isOwner) {
        logger.warn('Unauthorized resource access attempt', {
          userId: req.user.id,
          resourceId,
          resourceType: req.route.path,
          method: req.method
        });
        throw new AppError('Access denied', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Rate limiting middleware for sensitive operations
 */
export const rateLimitSensitive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const identifier = req.user?.id || req.ip;
    const key = `rate_limit:sensitive:${identifier}`;
    
    const attempts = await cache.get(key);
    const maxAttempts = 10; // 10 attempts per hour
    const windowMs = 3600000; // 1 hour

    if (attempts && parseInt(attempts) >= maxAttempts) {
      throw new AppError('Rate limit exceeded for sensitive operations', 429);
    }

    await cache.incr(key);
    await cache.expire(key, windowMs / 1000);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * API key authentication middleware (for external integrations)
 */
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      throw new AppError('API key is required', 401);
    }

    // Check API key in cache first
    const cacheKey = `api_key:${apiKey}`;
    let keyInfo = await cache.get(cacheKey);

    if (!keyInfo) {
      // TODO: Implement API key validation logic
      // For now, we'll use a simple check
      if (apiKey !== process.env.API_KEY) {
        throw new AppError('Invalid API key', 401);
      }

      keyInfo = JSON.stringify({
        id: 'system',
        name: 'System API Key',
        permissions: ['read', 'write']
      });

      // Cache for 1 hour
      await cache.set(cacheKey, keyInfo, 3600);
    }

    // Attach API key info to request
    req.apiKey = JSON.parse(keyInfo);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Logout middleware - blacklists the current token
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (token) {
      // Decode token to get expiration
      const decoded = jwt.decode(token) as JWTPayload;
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        await blacklistToken(token, expiresAt);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Extend Express Request interface for API key
declare global {
  namespace Express {
    interface Request {
      apiKey?: {
        id: string;
        name: string;
        permissions: string[];
      };
    }
  }
}