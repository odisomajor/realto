import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { promises as fs } from 'fs';
import path from 'path';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceStatus;
    cache: ServiceStatus;
    filesystem: ServiceStatus;
    memory: ServiceStatus;
    email?: ServiceStatus;
    sms?: ServiceStatus;
    push?: ServiceStatus;
  };
}

interface ServiceStatus {
  status: 'healthy' | 'unhealthy' | 'not_configured';
  responseTime?: number;
  error?: string;
  details?: any;
}

const prisma = new PrismaClient();
let redis: Redis | null = null;

// Initialize Redis connection if configured
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    connectTimeout: 5000,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    retryDelayOnClusterDown: 300
  });
}

// Check database health
async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      responseTime: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

// Check Redis cache health
async function checkCache(): Promise<ServiceStatus> {
  if (!redis) {
    return { status: 'not_configured' };
  }

  const start = Date.now();
  try {
    await redis.ping();
    return {
      status: 'healthy',
      responseTime: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown cache error'
    };
  }
}

// Check filesystem health
async function checkFilesystem(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    await fs.access(uploadDir);
    
    // Try to write a test file
    const testFile = path.join(uploadDir, '.health-check');
    await fs.writeFile(testFile, 'health-check');
    await fs.unlink(testFile);
    
    return {
      status: 'healthy',
      responseTime: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown filesystem error'
    };
  }
}

// Check memory usage
function checkMemory(): ServiceStatus {
  const memUsage = process.memoryUsage();
  const totalMem = memUsage.heapTotal;
  const usedMem = memUsage.heapUsed;
  const memoryUsagePercent = (usedMem / totalMem) * 100;
  
  const status = memoryUsagePercent > 90 ? 'unhealthy' : 
                 memoryUsagePercent > 75 ? 'degraded' : 'healthy';
  
  return {
    status: status as 'healthy' | 'unhealthy',
    details: {
      heapUsed: Math.round(usedMem / 1024 / 1024),
      heapTotal: Math.round(totalMem / 1024 / 1024),
      usagePercent: Math.round(memoryUsagePercent),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024)
    }
  };
}

// Check email service (if configured)
async function checkEmailService(): Promise<ServiceStatus> {
  if (!process.env.SMTP_HOST) {
    return { status: 'not_configured' };
  }

  // For now, just check if configuration exists
  // In a real implementation, you might want to test SMTP connection
  return {
    status: 'healthy',
    details: {
      configured: true,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT
    }
  };
}

// Check SMS service (if configured)
async function checkSMSService(): Promise<ServiceStatus> {
  if (!process.env.TWILIO_ACCOUNT_SID) {
    return { status: 'not_configured' };
  }

  return {
    status: 'healthy',
    details: {
      configured: true,
      accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...'
    }
  };
}

// Check push notification service (if configured)
async function checkPushService(): Promise<ServiceStatus> {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return { status: 'not_configured' };
  }

  return {
    status: 'healthy',
    details: {
      configured: true,
      vapidConfigured: !!process.env.VAPID_PRIVATE_KEY
    }
  };
}

// Main health check function
export async function performHealthCheck(): Promise<HealthStatus> {
  const startTime = Date.now();
  
  const [
    database,
    cache,
    filesystem,
    memory,
    email,
    sms,
    push
  ] = await Promise.all([
    checkDatabase(),
    checkCache(),
    checkFilesystem(),
    Promise.resolve(checkMemory()),
    checkEmailService(),
    checkSMSService(),
    checkPushService()
  ]);

  const services = {
    database,
    cache,
    filesystem,
    memory,
    ...(email.status !== 'not_configured' && { email }),
    ...(sms.status !== 'not_configured' && { sms }),
    ...(push.status !== 'not_configured' && { push })
  };

  // Determine overall status
  const criticalServices = [database, filesystem];
  const hasCriticalFailure = criticalServices.some(service => service.status === 'unhealthy');
  const hasAnyFailure = Object.values(services).some(service => service.status === 'unhealthy');
  const hasDegradation = Object.values(services).some(service => service.status === 'degraded');

  let overallStatus: 'healthy' | 'unhealthy' | 'degraded';
  if (hasCriticalFailure) {
    overallStatus = 'unhealthy';
  } else if (hasAnyFailure || hasDegradation) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services
  };
}

// Health check endpoint handler
export const healthCheckHandler = async (req: Request, res: Response) => {
  try {
    const health = await performHealthCheck();
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown health check error'
    });
  }
};

// Readiness check (for Kubernetes)
export const readinessHandler = async (req: Request, res: Response) => {
  try {
    const database = await checkDatabase();
    
    if (database.status === 'healthy') {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not_ready', reason: 'database_unavailable' });
    }
  } catch (error) {
    res.status(503).json({ 
      status: 'not_ready', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Liveness check (for Kubernetes)
export const livenessHandler = (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};