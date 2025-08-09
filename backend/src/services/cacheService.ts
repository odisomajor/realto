import Redis from 'ioredis';
import { logger } from '../utils/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export interface NotificationCache {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface UserNotificationStats {
  totalCount: number;
  unreadCount: number;
  lastNotificationAt?: string;
  notificationsByType: Record<string, number>;
}

export class CacheService {
  private redis: Redis | null = null;
  private isConnected = false;
  private readonly defaultTTL = 3600; // 1 hour
  private readonly keyPrefix = 'realestate:';

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const redisUrl = process.env.REDIS_URL;
      const cacheEnabled = process.env.CACHE_ENABLED === 'true';
      
      if (!redisUrl || !cacheEnabled) {
        logger.info('Redis cache service: Disabled (REDIS_URL not configured or CACHE_ENABLED=false)');
        return;
      }

      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.redis.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis cache service: Connected successfully');
      });

      this.redis.on('error', (error) => {
        this.isConnected = false;
        logger.error('Redis cache service error:', error);
      });

      this.redis.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis cache service: Connection closed');
      });

      // Test connection
      await this.redis.connect();
      await this.redis.ping();

    } catch (error) {
      logger.error('Failed to initialize Redis cache service:', error);
      this.isConnected = false;
    }
  }

  private getKey(key: string, prefix?: string): string {
    const actualPrefix = prefix || this.keyPrefix;
    return `${actualPrefix}${key}`;
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isConnected || !this.redis) {
      return false;
    }

    try {
      const cacheKey = this.getKey(key, options.prefix);
      const serializedValue = JSON.stringify(value);
      const ttl = options.ttl || this.defaultTTL;

      await this.redis.setex(cacheKey, ttl, serializedValue);
      return true;

    } catch (error) {
      logger.error(`Failed to set cache key ${key}:`, error);
      return false;
    }
  }

  async get<T = any>(key: string, prefix?: string): Promise<T | null> {
    if (!this.isConnected || !this.redis) {
      return null;
    }

    try {
      const cacheKey = this.getKey(key, prefix);
      const value = await this.redis.get(cacheKey);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;

    } catch (error) {
      logger.error(`Failed to get cache key ${key}:`, error);
      return null;
    }
  }

  async del(key: string, prefix?: string): Promise<boolean> {
    if (!this.isConnected || !this.redis) {
      return false;
    }

    try {
      const cacheKey = this.getKey(key, prefix);
      await this.redis.del(cacheKey);
      return true;

    } catch (error) {
      logger.error(`Failed to delete cache key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string, prefix?: string): Promise<boolean> {
    if (!this.isConnected || !this.redis) {
      return false;
    }

    try {
      const cacheKey = this.getKey(key, prefix);
      const result = await this.redis.exists(cacheKey);
      return result === 1;

    } catch (error) {
      logger.error(`Failed to check cache key existence ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttl: number, prefix?: string): Promise<boolean> {
    if (!this.isConnected || !this.redis) {
      return false;
    }

    try {
      const cacheKey = this.getKey(key, prefix);
      await this.redis.expire(cacheKey, ttl);
      return true;

    } catch (error) {
      logger.error(`Failed to set expiration for cache key ${key}:`, error);
      return false;
    }
  }

  // Notification-specific cache methods
  async cacheUserNotifications(userId: string, notifications: NotificationCache[], ttl: number = 300): Promise<boolean> {
    const key = `notifications:user:${userId}`;
    return this.set(key, notifications, { ttl });
  }

  async getUserNotifications(userId: string): Promise<NotificationCache[] | null> {
    const key = `notifications:user:${userId}`;
    return this.get<NotificationCache[]>(key);
  }

  async cacheUserNotificationStats(userId: string, stats: UserNotificationStats, ttl: number = 600): Promise<boolean> {
    const key = `notifications:stats:${userId}`;
    return this.set(key, stats, { ttl });
  }

  async getUserNotificationStats(userId: string): Promise<UserNotificationStats | null> {
    const key = `notifications:stats:${userId}`;
    return this.get<UserNotificationStats>(key);
  }

  async invalidateUserNotificationCache(userId: string): Promise<void> {
    const keys = [
      `notifications:user:${userId}`,
      `notifications:stats:${userId}`,
      `notifications:unread:${userId}`,
    ];

    for (const key of keys) {
      await this.del(key);
    }
  }

  async cacheUnreadCount(userId: string, count: number, ttl: number = 300): Promise<boolean> {
    const key = `notifications:unread:${userId}`;
    return this.set(key, count, { ttl });
  }

  async getUnreadCount(userId: string): Promise<number | null> {
    const key = `notifications:unread:${userId}`;
    return this.get<number>(key);
  }

  // Rate limiting cache methods
  async incrementRateLimit(identifier: string, windowSeconds: number = 3600): Promise<number> {
    if (!this.isConnected || !this.redis) {
      return 0;
    }

    try {
      const key = `ratelimit:${identifier}`;
      const current = await this.redis.incr(key);
      
      if (current === 1) {
        await this.redis.expire(key, windowSeconds);
      }
      
      return current;

    } catch (error) {
      logger.error(`Failed to increment rate limit for ${identifier}:`, error);
      return 0;
    }
  }

  async getRateLimit(identifier: string): Promise<number> {
    if (!this.isConnected || !this.redis) {
      return 0;
    }

    try {
      const key = `ratelimit:${identifier}`;
      const value = await this.redis.get(key);
      return value ? parseInt(value, 10) : 0;

    } catch (error) {
      logger.error(`Failed to get rate limit for ${identifier}:`, error);
      return 0;
    }
  }

  // Session cache methods
  async cacheUserSession(userId: string, sessionData: any, ttl: number = 86400): Promise<boolean> {
    const key = `session:${userId}`;
    return this.set(key, sessionData, { ttl });
  }

  async getUserSession(userId: string): Promise<any | null> {
    const key = `session:${userId}`;
    return this.get(key);
  }

  async invalidateUserSession(userId: string): Promise<boolean> {
    const key = `session:${userId}`;
    return this.del(key);
  }

  // Bulk operations
  async mget(keys: string[], prefix?: string): Promise<(any | null)[]> {
    if (!this.isConnected || !this.redis) {
      return keys.map(() => null);
    }

    try {
      const cacheKeys = keys.map(key => this.getKey(key, prefix));
      const values = await this.redis.mget(...cacheKeys);
      
      return values.map(value => {
        if (value === null) return null;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });

    } catch (error) {
      logger.error('Failed to get multiple cache keys:', error);
      return keys.map(() => null);
    }
  }

  async mset(keyValuePairs: Array<{ key: string; value: any; ttl?: number }>, prefix?: string): Promise<boolean> {
    if (!this.isConnected || !this.redis) {
      return false;
    }

    try {
      const pipeline = this.redis.pipeline();
      
      for (const { key, value, ttl } of keyValuePairs) {
        const cacheKey = this.getKey(key, prefix);
        const serializedValue = JSON.stringify(value);
        const cacheTTL = ttl || this.defaultTTL;
        
        pipeline.setex(cacheKey, cacheTTL, serializedValue);
      }
      
      await pipeline.exec();
      return true;

    } catch (error) {
      logger.error('Failed to set multiple cache keys:', error);
      return false;
    }
  }

  // Health check
  async healthCheck(): Promise<{ connected: boolean; latency?: number }> {
    if (!this.redis) {
      return { connected: false };
    }

    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;
      
      return { connected: true, latency };

    } catch (error) {
      return { connected: false };
    }
  }

  // Cleanup and shutdown
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
      this.isConnected = false;
      logger.info('Redis cache service: Disconnected');
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }

  // Pattern-based operations
  async getKeysByPattern(pattern: string, prefix?: string): Promise<string[]> {
    if (!this.isConnected || !this.redis) {
      return [];
    }

    try {
      const searchPattern = this.getKey(pattern, prefix);
      const keys = await this.redis.keys(searchPattern);
      return keys;

    } catch (error) {
      logger.error(`Failed to get keys by pattern ${pattern}:`, error);
      return [];
    }
  }

  async deleteByPattern(pattern: string, prefix?: string): Promise<number> {
    if (!this.isConnected || !this.redis) {
      return 0;
    }

    try {
      const keys = await this.getKeysByPattern(pattern, prefix);
      if (keys.length === 0) {
        return 0;
      }

      await this.redis.del(...keys);
      return keys.length;

    } catch (error) {
      logger.error(`Failed to delete keys by pattern ${pattern}:`, error);
      return 0;
    }
  }
}

export const cacheService = new CacheService();