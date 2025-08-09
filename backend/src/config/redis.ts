import Redis from 'ioredis';
import { logger } from '@/utils/logger';

// Redis configuration
const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  connectTimeout: 10000,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  retryDelayOnClusterDown: 300
};

// Create Redis instance
export const redis = new Redis(redisConfig);

// Redis event handlers
redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('ready', () => {
  logger.info('Redis is ready to accept commands');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('Redis reconnecting...');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Closing Redis connection...');
  await redis.quit();
});

process.on('SIGTERM', async () => {
  logger.info('Closing Redis connection...');
  await redis.quit();
});

export default redis;