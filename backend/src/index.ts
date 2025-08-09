import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import promClient from 'prom-client';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { authRoutes } from '@/routes/auth';
import { userRoutes } from '@/routes/users';
import { propertyRoutes } from '@/routes/properties';
import { fileRoutes } from '@/routes/files';
import notificationRoutes from '@/routes/notifications';

// Import services for health checks
import { emailService } from '@/services/emailService';
import { smsService } from '@/services/smsService';
import { pushNotificationService } from '@/services/pushNotificationService';
import { cacheService } from '@/services/cacheService';

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const activeUsersGauge = new promClient.Gauge({
  name: 'active_users_total',
  help: 'Total number of active users'
});

const propertyViewsCounter = new promClient.Counter({
  name: 'property_views_total',
  help: 'Total number of property views'
});

// Trust proxy for rate limiting and security
app.set('trust proxy', 1);

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });
    
    httpRequestDuration.observe({
      method: req.method,
      route,
      status_code: res.statusCode
    }, duration);
  });
  
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['https://xillix.co.ke', 'https://www.xillix.co.ke'])
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and metrics
    return req.path === '/health' || req.path === '/ready' || req.path === '/live' || req.path === '/metrics';
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', limiter);
}

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// Health check endpoint with comprehensive service status
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      email: 'unknown',
      sms: 'unknown',
      push: 'unknown',
      cache: 'unknown'
    }
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.services.database = 'connected';
  } catch (error) {
    healthCheck.services.database = 'disconnected';
    healthCheck.status = 'degraded';
  }

  // Check email service
  try {
    if (emailService.isConfigured()) {
      healthCheck.services.email = 'configured';
    } else {
      healthCheck.services.email = 'not configured';
    }
  } catch (error) {
    healthCheck.services.email = 'error';
  }

  // Check SMS service
  try {
    if (smsService.isConfigured()) {
      healthCheck.services.sms = 'configured';
    } else {
      healthCheck.services.sms = 'not configured';
    }
  } catch (error) {
    healthCheck.services.sms = 'error';
  }

  // Check push notification service
  try {
    if (pushNotificationService.isConfigured()) {
      healthCheck.services.push = 'configured';
    } else {
      healthCheck.services.push = 'not configured';
    }
  } catch (error) {
    healthCheck.services.push = 'error';
  }

  // Check cache service
  try {
    const cacheStatus = await cacheService.healthCheck();
    healthCheck.services.cache = cacheStatus ? 'connected' : 'disconnected';
  } catch (error) {
    healthCheck.services.cache = 'not configured';
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 200 : 503;
  
  res.status(statusCode).json(healthCheck);
});

// Readiness probe
app.get('/ready', async (req, res) => {
  try {
    // Check if essential services are ready
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Database not ready'
    });
  }
});

// Liveness probe
app.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/notifications', notificationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Xillix Real Estate API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      ready: '/ready',
      live: '/live',
      metrics: '/metrics',
      docs: '/api-docs'
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
let server: any;

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      
      try {
        // Close database connections
        await prisma.$disconnect();
        logger.info('Database connections closed.');
        
        // Close other services
        await cacheService.disconnect();
        logger.info('Cache service disconnected.');
        
        logger.info('Graceful shutdown completed.');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
  
  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Start server
server = app.listen(PORT, () => {
  logger.info(`🚀 Xillix Real Estate API server running on port ${PORT}`);
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
  logger.info(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export { app, server, activeUsersGauge, propertyViewsCounter };
export default app;