import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
import { emailService } from './services/emailService';
import { smsService } from './services/smsService';
import { pushNotificationService } from './services/pushNotificationService';
import { templateService } from './services/templateService';
import { cacheService } from './services/cacheService';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const initializeServices = async () => {
  try {
    // Services are initialized in their constructors
    logger.info('All notification services initialized');
    
    // Log service status
    logger.info(`Email service: ${emailService.isReady() ? 'Ready' : 'Not configured'}`);
    logger.info(`SMS service: ${smsService.isReady() ? 'Ready' : 'Not configured'}`);
    logger.info(`Push service: ${pushNotificationService.isReady() ? 'Ready' : 'Not configured'}`);
    logger.info(`Cache service: ${cacheService.isReady() ? 'Ready' : 'Not configured'}`);
    
  } catch (error) {
    logger.error('Service initialization failed:', error);
  }
};

// Simple logger
const log = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data || ''),
  error: (message: string, data?: any) => console.error(`[ERROR] ${message}`, data || ''),
  warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data || '')
};

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check service status
    const services = {
      database: 'connected',
      email: emailService.isReady() ? 'ready' : 'not configured',
      sms: smsService.isReady() ? 'ready' : 'not configured',
      push: pushNotificationService.isReady() ? 'ready' : 'not configured',
      cache: cacheService.isReady() ? 'ready' : 'not configured',
    };

    // Check cache health if available
    let cacheHealth = null;
    if (cacheService.isReady()) {
      cacheHealth = await cacheService.healthCheck();
    }

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services,
      cache: cacheHealth,
      vapidPublicKey: pushNotificationService.getVapidPublicKey(),
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

// Basic notification endpoints
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId, page = 1, limit = 20, type, read } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    if (userId) where.userId = String(userId);
    if (type) where.type = String(type);
    if (read !== undefined) where.read = read === 'true';

    const notifications = await prisma.notification.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    const total = await prisma.notification.count({ where });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    log.error('Failed to fetch notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

// Get notifications endpoint with caching
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, isRead, limit = '20', offset = '0' } = req.query;

    // Try to get from cache first
    let notifications = null;
    if (cacheService.isReady()) {
      notifications = await cacheService.getUserNotifications(userId);
    }

    if (!notifications) {
      // Build query filters
      const where: any = { userId };
      if (type) where.type = type as string;
      if (isRead !== undefined) where.isRead = isRead === 'true';

      // Fetch from database
      const dbNotifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      // Transform data for response
      notifications = dbNotifications.map(notification => ({
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data ? JSON.parse(notification.data) : null,
        priority: notification.priority,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      }));

      // Cache the results
      if (cacheService.isReady()) {
        await cacheService.cacheUserNotifications(userId, notifications, 300); // 5 minutes
      }
    }

    res.json({
      notifications,
      total: notifications.length,
      hasMore: notifications.length === parseInt(limit as string),
    });

  } catch (error) {
    logger.error('Failed to fetch notifications:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications',
    });
  }
});


app.post('/api/notifications', async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      data = {},
      priority = 'MEDIUM',
      channels = ['DATABASE']
    } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, type, title, message'
      });
    }

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null, // Convert to JSON string for SQLite
        read: false,
        sent: true,
        sentAt: new Date()
      }
    });

    // Invalidate user's notification cache
    if (cacheService.isReady()) {
      try {
        await cacheService.invalidateUserNotificationCache(userId);
      } catch (error) {
        logger.error('Failed to invalidate cache:', error);
      }
    }

    // Send via requested channels
    const results = {
      database: true,
      email: false,
      sms: false,
      push: false,
    };

    // Send email if requested and configured
    if (channels.includes('EMAIL') && emailService.isReady()) {
      try {
        const emailResult = await emailService.sendNotificationEmail(
          userId,
          title,
          message,
          data
        );
        results.email = emailResult;
      } catch (error) {
        logger.error('Failed to send email notification:', error);
      }
    }

    // Send SMS if requested and configured
    if (channels.includes('SMS') && smsService.isReady()) {
      try {
        const smsResult = await smsService.sendNotificationSMS(
          userId,
          title,
          message,
          data
        );
        results.sms = smsResult;
      } catch (error) {
        logger.error('Failed to send SMS notification:', error);
      }
    }

    // Send push notification if requested and configured
    if (channels.includes('PUSH') && pushNotificationService.isReady()) {
      try {
        const pushResult = await pushNotificationService.sendNotificationPush(
          userId,
          title,
          message,
          data
        );
        results.push = pushResult;
      } catch (error) {
        logger.error('Failed to send push notification:', error);
      }
    }

    log.info(`Notification created: ${notification.id} for user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        notification,
        channels: results
      }
    });
  } catch (error) {
    log.error('Failed to create notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    });
  }
});

// Mark notification as read endpoint
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    // Invalidate user's notification cache
    await cacheService.invalidateUserNotificationCache(notification.userId);

    res.json({
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data ? JSON.parse(notification.data) : null,
      priority: notification.priority,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });

  } catch (error) {
    logger.error('Failed to mark notification as read:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
    });
  }
});

// Get user notification statistics with caching
app.get('/api/notifications/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    // Try to get from cache first
    let stats = null;
    if (cacheService.isReady()) {
      stats = await cacheService.getUserNotificationStats(userId);
    }

    if (!stats) {
      // Calculate stats from database
      const [totalCount, unreadCount, notificationsByType, lastNotification] = await Promise.all([
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
        prisma.notification.groupBy({
          by: ['type'],
          where: { userId },
          _count: { type: true },
        }),
        prisma.notification.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
      ]);

      // Transform grouped data
      const typeStats: Record<string, number> = {};
      notificationsByType.forEach(group => {
        typeStats[group.type] = group._count.type;
      });

      stats = {
        totalCount,
        unreadCount,
        lastNotificationAt: lastNotification?.createdAt?.toISOString(),
        notificationsByType: typeStats,
      };

      // Cache the results
      if (cacheService.isReady()) {
        await cacheService.cacheUserNotificationStats(userId, stats, 600); // 10 minutes
      }
    }

    res.json(stats);

  } catch (error) {
    logger.error('Failed to fetch notification stats:', error);
    res.status(500).json({
      error: 'Failed to fetch notification stats',
    });
  }
});

// Template management endpoints
app.get('/api/templates', async (req, res) => {
  try {
    const { type } = req.query;
    
    let templates;
    if (type) {
      templates = templateService.getTemplatesByType(type as 'EMAIL' | 'SMS' | 'PUSH');
    } else {
      templates = templateService.getAllTemplates();
    }

    res.json({ templates });

  } catch (error) {
    logger.error('Failed to fetch templates:', error);
    res.status(500).json({
      error: 'Failed to fetch templates',
    });
  }
});

app.get('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = templateService.getTemplate(id);

    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
      });
    }

    res.json({ template });

  } catch (error) {
    logger.error('Failed to fetch template:', error);
    res.status(500).json({
      error: 'Failed to fetch template',
    });
  }
});

// Push notification subscription endpoints
app.post('/api/push/subscribe', async (req, res) => {
  try {
    const { userId, subscription, userAgent } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({
        error: 'Missing required fields: userId, subscription',
      });
    }

    const success = await pushNotificationService.subscribeUser(
      userId,
      subscription,
      userAgent
    );

    if (success) {
      res.json({ success: true, message: 'Subscription saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save subscription' });
    }

  } catch (error) {
    logger.error('Failed to handle push subscription:', error);
    res.status(500).json({
      error: 'Failed to handle push subscription',
    });
  }
});

app.delete('/api/push/unsubscribe', async (req, res) => {
  try {
    const { userId, endpoint } = req.body;

    if (!userId || !endpoint) {
      return res.status(400).json({
        error: 'Missing required fields: userId, endpoint',
      });
    }

    const success = await pushNotificationService.unsubscribeUser(userId, endpoint);

    if (success) {
      res.json({ success: true, message: 'Unsubscribed successfully' });
    } else {
      res.status(500).json({ error: 'Failed to unsubscribe' });
    }

  } catch (error) {
    logger.error('Failed to handle push unsubscription:', error);
    res.status(500).json({
      error: 'Failed to handle push unsubscription',
    });
  }
});

app.get('/api/push/vapid-key', (req, res) => {
  const publicKey = pushNotificationService.getVapidPublicKey();
  
  if (publicKey) {
    res.json({ publicKey });
  } else {
    res.status(503).json({
      error: 'Push notifications not configured',
    });
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  log.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  log.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await prisma.$disconnect();
    log.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    log.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Initialize services
    await initializeServices();

    // Connect to database
    await prisma.$connect();
    logger.info('Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`🚀 Notification server running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`📧 API endpoints: http://localhost:${PORT}/api`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    await cacheService.disconnect();
    logger.info('Services disconnected successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  
  try {
    await prisma.$disconnect();
    await cacheService.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();

export default app;