import { Request, Response, NextFunction } from 'express';
import { redis } from '@/config/database';
import { logger } from '@/utils/logger';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
}

/**
 * Redis caching middleware for API responses
 */
export const cache = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = (req: Request) => `cache:${req.method}:${req.originalUrl}`,
    condition = () => true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if condition is not met or Redis is not available
    if (!condition(req) || !redis) {
      return next();
    }

    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = keyGenerator(req);

    try {
      // Try to get cached response
      const cachedResponse = await redis.get(cacheKey);
      
      if (cachedResponse) {
        logger.info(`Cache hit for key: ${cacheKey}`);
        const parsedResponse = JSON.parse(cachedResponse);
        
        // Set cache headers
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${ttl}`
        });
        
        return res.status(parsedResponse.statusCode || 200).json(parsedResponse.data);
      }

      // Cache miss - continue to route handler
      logger.info(`Cache miss for key: ${cacheKey}`);
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data: any) {
        // Cache successful responses only
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const responseToCache = {
            statusCode: res.statusCode,
            data: data
          };
          
          redis.setex(cacheKey, ttl, JSON.stringify(responseToCache))
            .then(() => {
              logger.info(`Response cached for key: ${cacheKey}, TTL: ${ttl}s`);
            })
            .catch((error) => {
              logger.error(`Failed to cache response for key: ${cacheKey}`, error);
            });
        }
        
        // Set cache headers
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${ttl}`
        });
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error for key: ${cacheKey}`, error);
      // Continue without caching on error
      next();
    }
  };
};

/**
 * Cache invalidation helper
 */
export const invalidateCache = async (pattern: string): Promise<void> => {
  if (!redis) {
    logger.warn('Redis not available for cache invalidation');
    return;
  }

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`Invalidated ${keys.length} cache entries matching pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error(`Failed to invalidate cache for pattern: ${pattern}`, error);
  }
};

/**
 * Specific cache configurations for different endpoints
 */
export const cacheConfigs = {
  // Properties list - cache for 5 minutes
  properties: cache({
    ttl: 300,
    keyGenerator: (req) => {
      const query = new URLSearchParams(req.query as any).toString();
      return `cache:properties:${query}`;
    }
  }),

  // Individual property - cache for 10 minutes
  property: cache({
    ttl: 600,
    keyGenerator: (req) => `cache:property:${req.params.id}`
  }),

  // Property analytics - cache for 1 hour
  analytics: cache({
    ttl: 3600,
    keyGenerator: (req) => `cache:analytics:${req.params.id || 'all'}`
  }),

  // Search results - cache for 2 minutes (shorter due to frequent updates)
  search: cache({
    ttl: 120,
    keyGenerator: (req) => {
      const query = new URLSearchParams(req.query as any).toString();
      return `cache:search:${query}`;
    }
  }),

  // Static data - cache for 1 hour
  static: cache({
    ttl: 3600
  })
};

/**
 * Cache warming utility
 */
export const warmCache = async (endpoints: string[]): Promise<void> => {
  logger.info('Starting cache warming...');
  
  for (const endpoint of endpoints) {
    try {
      // This would typically make internal API calls to warm the cache
      logger.info(`Warming cache for endpoint: ${endpoint}`);
      // Implementation depends on your specific needs
    } catch (error) {
      logger.error(`Failed to warm cache for endpoint: ${endpoint}`, error);
    }
  }
  
  logger.info('Cache warming completed');
};

export default cache;