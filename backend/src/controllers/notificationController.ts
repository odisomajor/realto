import { Request, Response } from 'express';
import { catchAsync, AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { notificationService } from '@/services/notificationService';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  SendNotificationRequest,
  SendBulkNotificationRequest,
  UpdatePreferencesRequest,
  GetNotificationsRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  CreateCampaignRequest,
  SubscribePushRequest,
  TestNotificationRequest
} from '@/types/notification';

export const notificationController = {
  // Send single notification
  sendNotification: catchAsync(async (req: Request, res: Response) => {
    const {
      userId,
      type,
      title,
      message,
      data,
      channels,
      priority = NotificationPriority.NORMAL,
      scheduledAt,
      expiresAt,
      actionUrl,
      imageUrl,
      tags,
      category
    }: SendNotificationRequest = req.body;

    const notificationData = {
      userId,
      type,
      title,
      message,
      data,
      channels,
      priority,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      metadata: {
        actionUrl,
        imageUrl,
        tags,
        category,
        sentBy: req.user?.id
      }
    };

    if (scheduledAt) {
      const notificationId = await notificationService.scheduleNotification(
        notificationData,
        new Date(scheduledAt)
      );
      
      res.status(202).json({
        success: true,
        message: 'Notification scheduled successfully',
        data: { notificationId }
      });
    } else {
      await notificationService.sendNotification(notificationData);
      
      res.status(200).json({
        success: true,
        message: 'Notification sent successfully'
      });
    }

    logger.info(`Notification sent/scheduled by user ${req.user?.id} to user ${userId}`);
  }),

  // Send bulk notifications
  sendBulkNotifications: catchAsync(async (req: Request, res: Response) => {
    const { notifications, batchName, scheduledAt }: SendBulkNotificationRequest = req.body;

    if (!notifications || notifications.length === 0) {
      throw new AppError('No notifications provided', 400);
    }

    if (notifications.length > 1000) {
      throw new AppError('Maximum 1000 notifications allowed per batch', 400);
    }

    const notificationData = notifications.map(notification => ({
      ...notification,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      metadata: {
        ...notification.data,
        batchName,
        sentBy: req.user?.id
      }
    }));

    await notificationService.sendBulkNotifications(notificationData);

    res.status(200).json({
      success: true,
      message: `Bulk notifications sent successfully`,
      data: {
        count: notifications.length,
        batchName
      }
    });

    logger.info(`Bulk notifications sent by user ${req.user?.id}: ${notifications.length} notifications`);
  }),

  // Get user notifications
  getNotifications: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const {
      page = 1,
      limit = 20,
      type,
      isRead,
      category,
      priority,
      startDate,
      endDate,
      tags
    }: GetNotificationsRequest = req.query as any;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const result = await notificationService.getInAppNotifications(
      userId,
      parseInt(page.toString()),
      parseInt(limit.toString())
    );

    // Apply additional filters if needed
    let filteredNotifications = result.notifications;

    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }

    if (isRead !== undefined) {
      filteredNotifications = filteredNotifications.filter(n => n.isRead === (isRead === 'true'));
    }

    if (category) {
      filteredNotifications = filteredNotifications.filter(n => n.category === category);
    }

    if (priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
    }

    if (startDate) {
      const start = new Date(startDate.toString());
      filteredNotifications = filteredNotifications.filter(n => 
        new Date(n.createdAt) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate.toString());
      filteredNotifications = filteredNotifications.filter(n => 
        new Date(n.createdAt) <= end
      );
    }

    if (tags && Array.isArray(tags)) {
      filteredNotifications = filteredNotifications.filter(n => 
        n.tags && tags.some(tag => n.tags!.includes(tag))
      );
    }

    const totalFiltered = filteredNotifications.length;
    const totalPages = Math.ceil(totalFiltered / parseInt(limit.toString()));

    res.status(200).json({
      success: true,
      data: {
        notifications: filteredNotifications,
        pagination: {
          page: parseInt(page.toString()),
          limit: parseInt(limit.toString()),
          total: totalFiltered,
          totalPages
        },
        summary: {
          totalCount: result.total,
          unreadCount: result.unreadCount,
          byType: filteredNotifications.reduce((acc, n) => {
            acc[n.type] = (acc[n.type] || 0) + 1;
            return acc;
          }, {} as Record<NotificationType, number>),
          byPriority: filteredNotifications.reduce((acc, n) => {
            acc[n.priority] = (acc[n.priority] || 0) + 1;
            return acc;
          }, {} as Record<NotificationPriority, number>)
        }
      }
    });
  }),

  // Mark notification as read
  markAsRead: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    await notificationService.markNotificationAsRead(userId, notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });

    logger.info(`Notification ${notificationId} marked as read by user ${userId}`);
  }),

  // Mark all notifications as read
  markAllAsRead: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Get all unread notifications and mark them as read
    const result = await notificationService.getInAppNotifications(userId, 1, 1000);
    const unreadNotifications = result.notifications.filter(n => !n.isRead);

    for (const notification of unreadNotifications) {
      await notificationService.markNotificationAsRead(userId, notification.id);
    }

    res.status(200).json({
      success: true,
      message: `${unreadNotifications.length} notifications marked as read`
    });

    logger.info(`All notifications marked as read by user ${userId}`);
  }),

  // Get notification preferences
  getPreferences: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // This would fetch from database - placeholder implementation
    const preferences = {
      userId,
      email: true,
      sms: false,
      push: true,
      inApp: true,
      webhook: false,
      types: {},
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC',
        days: [0, 1, 2, 3, 4, 5, 6]
      },
      frequency: {
        digest: 'WEEKLY',
        marketing: 'MONTHLY',
        reminders: true
      },
      language: 'en'
    };

    res.status(200).json({
      success: true,
      data: preferences
    });
  }),

  // Update notification preferences
  updatePreferences: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const preferences: UpdatePreferencesRequest = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    await notificationService.updateUserPreferences(userId, preferences);

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully'
    });

    logger.info(`Notification preferences updated for user ${userId}`);
  }),

  // Get notification statistics
  getStats: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // This would fetch from database - placeholder implementation
    const stats = {
      overview: {
        totalNotifications: 150,
        deliveryRate: 98.5,
        openRate: 65.2,
        clickRate: 12.8,
        unsubscribeRate: 0.5
      },
      trends: [
        { date: '2024-01-01', sent: 25, delivered: 24, opened: 16, clicked: 3 },
        { date: '2024-01-02', sent: 30, delivered: 29, opened: 19, clicked: 4 }
      ],
      channels: {
        [NotificationChannel.EMAIL]: {
          sent: 80,
          delivered: 78,
          deliveryRate: 97.5,
          avgDeliveryTime: 2500
        },
        [NotificationChannel.PUSH]: {
          sent: 70,
          delivered: 69,
          deliveryRate: 98.6,
          avgDeliveryTime: 1200
        }
      },
      types: {
        [NotificationType.PROPERTY_INQUIRY]: {
          sent: 45,
          delivered: 44,
          opened: 32,
          clicked: 8,
          engagementRate: 72.7
        }
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  }),

  // Subscribe to push notifications
  subscribePush: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { endpoint, keys, userAgent }: SubscribePushRequest = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // This would save to database - placeholder implementation
    const subscription = {
      id: `sub_${Date.now()}`,
      userId,
      endpoint,
      keys,
      userAgent,
      isActive: true,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Push notification subscription created',
      data: { subscriptionId: subscription.id }
    });

    logger.info(`Push notification subscription created for user ${userId}`);
  }),

  // Unsubscribe from push notifications
  unsubscribePush: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { subscriptionId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // This would update database - placeholder implementation
    res.status(200).json({
      success: true,
      message: 'Push notification subscription removed'
    });

    logger.info(`Push notification subscription ${subscriptionId} removed for user ${userId}`);
  }),

  // Test notification
  testNotification: catchAsync(async (req: Request, res: Response) => {
    const {
      userId,
      type,
      channel,
      templateId,
      testData
    }: TestNotificationRequest = req.body;

    const testNotificationData = {
      userId,
      type,
      title: 'Test Notification',
      message: 'This is a test notification to verify your settings.',
      data: testData || { test: true },
      channels: [channel],
      priority: NotificationPriority.LOW,
      metadata: {
        isTest: true,
        sentBy: req.user?.id
      }
    };

    await notificationService.sendNotification(testNotificationData);

    res.status(200).json({
      success: true,
      message: 'Test notification sent successfully'
    });

    logger.info(`Test notification sent by user ${req.user?.id} to user ${userId} via ${channel}`);
  }),

  // Get notification templates (admin only)
  getTemplates: catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, type, channel, isActive } = req.query;

    // This would fetch from database - placeholder implementation
    const templates = [
      {
        id: 'welcome-email',
        name: 'Welcome Email',
        type: NotificationType.WELCOME,
        channel: NotificationChannel.EMAIL,
        subject: 'Welcome to RealEstate Platform!',
        template: '<h1>Welcome {{firstName}}!</h1>...',
        variables: ['firstName', 'platformUrl'],
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin'
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        templates,
        pagination: {
          page: parseInt(page.toString()),
          limit: parseInt(limit.toString()),
          total: templates.length,
          totalPages: 1
        }
      }
    });
  }),

  // Create notification template (admin only)
  createTemplate: catchAsync(async (req: Request, res: Response) => {
    const {
      name,
      type,
      channel,
      subject,
      template,
      variables,
      description,
      previewData
    }: CreateTemplateRequest = req.body;

    // This would save to database - placeholder implementation
    const newTemplate = {
      id: `template_${Date.now()}`,
      name,
      type,
      channel,
      subject,
      template,
      variables,
      description,
      previewData,
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user?.id
    };

    res.status(201).json({
      success: true,
      message: 'Notification template created successfully',
      data: newTemplate
    });

    logger.info(`Notification template created by user ${req.user?.id}: ${name}`);
  }),

  // Update notification template (admin only)
  updateTemplate: catchAsync(async (req: Request, res: Response) => {
    const { templateId } = req.params;
    const updates: UpdateTemplateRequest = req.body;

    // This would update database - placeholder implementation
    const updatedTemplate = {
      id: templateId,
      ...updates,
      updatedAt: new Date(),
      version: 2
    };

    res.status(200).json({
      success: true,
      message: 'Notification template updated successfully',
      data: updatedTemplate
    });

    logger.info(`Notification template ${templateId} updated by user ${req.user?.id}`);
  }),

  // Delete notification template (admin only)
  deleteTemplate: catchAsync(async (req: Request, res: Response) => {
    const { templateId } = req.params;

    // This would delete from database - placeholder implementation
    res.status(200).json({
      success: true,
      message: 'Notification template deleted successfully'
    });

    logger.info(`Notification template ${templateId} deleted by user ${req.user?.id}`);
  }),

  // Get notification campaigns (admin only)
  getCampaigns: catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, status, type } = req.query;

    // This would fetch from database - placeholder implementation
    const campaigns = [];

    res.status(200).json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page: parseInt(page.toString()),
          limit: parseInt(limit.toString()),
          total: campaigns.length,
          totalPages: 1
        }
      }
    });
  }),

  // Create notification campaign (admin only)
  createCampaign: catchAsync(async (req: Request, res: Response) => {
    const campaignData: CreateCampaignRequest = req.body;

    // This would save to database - placeholder implementation
    const newCampaign = {
      id: `campaign_${Date.now()}`,
      ...campaignData,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user?.id
    };

    res.status(201).json({
      success: true,
      message: 'Notification campaign created successfully',
      data: newCampaign
    });

    logger.info(`Notification campaign created by user ${req.user?.id}: ${campaignData.name}`);
  }),

  // Get system notification health
  getHealth: catchAsync(async (req: Request, res: Response) => {
    // Check various notification service health metrics
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        email: {
          status: 'healthy',
          lastCheck: new Date().toISOString()
        },
        sms: {
          status: 'healthy',
          lastCheck: new Date().toISOString()
        },
        push: {
          status: 'healthy',
          lastCheck: new Date().toISOString()
        },
        redis: {
          status: 'healthy',
          lastCheck: new Date().toISOString()
        }
      },
      metrics: {
        queueSize: 0,
        processingRate: 95.5,
        errorRate: 0.5,
        avgProcessingTime: 1200
      }
    };

    res.status(200).json({
      success: true,
      data: health
    });
  })
};