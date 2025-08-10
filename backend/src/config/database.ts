import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { logger } from '@/utils/logger';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// Prisma Client Configuration
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
  errorFormat: 'pretty'
});

// Redis Client Configuration
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnClusterDown: 300,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

// Redis event handlers
redis.on('connect', () => {
  logger.info('🔴 Redis connected successfully');
});

redis.on('ready', () => {
  logger.info('🔴 Redis ready to receive commands');
});

redis.on('error', (error) => {
  logger.error('🔴 Redis connection error:', error);
});

redis.on('close', () => {
  logger.warn('🔴 Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('🔴 Redis reconnecting...');
});

// Database connection test
const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    logger.info('📊 Database connected successfully');
    return true;
  } catch (error) {
    logger.error('📊 Database connection failed:', error);
    return false;
  }
};

// Redis connection test
const testRedisConnection = async (): Promise<boolean> => {
  try {
    await redis.ping();
    logger.info('🔴 Redis connection test successful');
    return true;
  } catch (error) {
    logger.error('🔴 Redis connection test failed:', error);
    return false;
  }
};

// Initialize connections
const initializeConnections = async (): Promise<void> => {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Test Redis connection
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      logger.warn('Redis connection failed, continuing without cache');
    }

    logger.info('✅ All database connections initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize database connections:', error);
    throw error;
  }
};

// Graceful shutdown
const closeConnections = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('📊 Database connection closed');
    
    redis.disconnect();
    logger.info('🔴 Redis connection closed');
    
    logger.info('✅ All database connections closed successfully');
  } catch (error) {
    logger.error('❌ Error closing database connections:', error);
    throw error;
  }
};

// Cache utilities
const cache = {
  // Get value from cache
  get: async (key: string): Promise<string | null> => {
    try {
      return await redis.get(key);
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  // Set value in cache
  set: async (key: string, value: string, ttl?: number): Promise<boolean> => {
    try {
      if (ttl) {
        await redis.setex(key, ttl, value);
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  },

  // Delete value from cache
  del: async (key: string): Promise<boolean> => {
    try {
      const result = await redis.del(key);
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  },

  // Set expiration for key
  expire: async (key: string, ttl: number): Promise<boolean> => {
    try {
      const result = await redis.expire(key, ttl);
      return result === 1;
    } catch (error) {
      logger.error('Cache expire error:', error);
      return false;
    }
  },

  // Get multiple values
  mget: async (keys: string[]): Promise<(string | null)[]> => {
    try {
      return await redis.mget(...keys);
    } catch (error) {
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  },

  // Set multiple values
  mset: async (keyValuePairs: Record<string, string>): Promise<boolean> => {
    try {
      const pairs: string[] = [];
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pairs.push(key, value);
      });
      await redis.mset(...pairs);
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  },

  // Increment value
  incr: async (key: string): Promise<number | null> => {
    try {
      return await redis.incr(key);
    } catch (error) {
      logger.error('Cache incr error:', error);
      return null;
    }
  },

  // Decrement value
  decr: async (key: string): Promise<number | null> => {
    try {
      return await redis.decr(key);
    } catch (error) {
      logger.error('Cache decr error:', error);
      return null;
    }
  },

  // Clear all cache
  flushall: async (): Promise<boolean> => {
    try {
      await redis.flushall();
      return true;
    } catch (error) {
      logger.error('Cache flushall error:', error);
      return false;
    }
  }
};

export const config = {
  prisma,
  redis,
  cache,
  initializeConnections,
  closeConnections,
  testDatabaseConnection,
  testRedisConnection
};