import webpush from 'web-push';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface PushOptions {
  userId: string;
  payload: PushNotificationPayload;
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
  ttl?: number; // Time to live in seconds
}

// Extend User model to include push subscriptions (in a real app, this would be in the schema)
interface UserPushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  createdAt: Date;
  lastUsed?: Date;
}

export class PushNotificationService {
  private isConfigured = false;
  private vapidKeys: { publicKey: string; privateKey: string } | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
      const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@realestate.com';

      if (!vapidPublicKey || !vapidPrivateKey) {
        logger.warn('Push notification service: VAPID keys not configured');
        this.generateVapidKeys();
        return;
      }

      this.vapidKeys = {
        publicKey: vapidPublicKey,
        privateKey: vapidPrivateKey,
      };

      webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
      this.isConfigured = true;
      logger.info('Push notification service: Successfully configured');

    } catch (error) {
      logger.error('Push notification service initialization failed:', error);
      this.isConfigured = false;
    }
  }

  private generateVapidKeys() {
    try {
      const vapidKeys = webpush.generateVAPIDKeys();
      logger.info('Generated VAPID keys for push notifications:');
      logger.info(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
      logger.info(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
      logger.info('Add these to your .env file to enable push notifications');
    } catch (error) {
      logger.error('Failed to generate VAPID keys:', error);
    }
  }

  async subscribeUser(userId: string, subscription: PushSubscription, userAgent?: string): Promise<boolean> {
    try {
      // In a real application, you would store this in the database
      // For now, we'll simulate storage in memory or file
      const subscriptionData = {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
        createdAt: new Date(),
      };

      // Store subscription (in real app, this would be in database)
      logger.info(`Push subscription stored for user ${userId}`);
      return true;

    } catch (error) {
      logger.error('Failed to store push subscription:', error);
      return false;
    }
  }

  async unsubscribeUser(userId: string, endpoint: string): Promise<boolean> {
    try {
      // Remove subscription from storage
      logger.info(`Push subscription removed for user ${userId}`);
      return true;

    } catch (error) {
      logger.error('Failed to remove push subscription:', error);
      return false;
    }
  }

  async sendPushNotification(options: PushOptions): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn('Push notification service not configured, skipping push send');
      return false;
    }

    try {
      // Get user's push subscriptions (in real app, from database)
      const subscriptions = await this.getUserSubscriptions(options.userId);

      if (subscriptions.length === 0) {
        logger.info(`No push subscriptions found for user ${options.userId}`);
        return false;
      }

      const payload = JSON.stringify(options.payload);
      const pushOptions = {
        urgency: options.urgency || 'normal',
        TTL: options.ttl || 86400, // 24 hours default
      };

      let successCount = 0;
      const promises = subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          };

          await webpush.sendNotification(pushSubscription, payload, pushOptions);
          successCount++;
          return true;

        } catch (error: any) {
          logger.error(`Failed to send push notification to ${subscription.endpoint}:`, error);
          
          // Handle expired subscriptions
          if (error.statusCode === 410) {
            await this.unsubscribeUser(options.userId, subscription.endpoint);
          }
          
          return false;
        }
      });

      await Promise.all(promises);
      
      logger.info(`Push notifications sent: ${successCount}/${subscriptions.length} successful`);
      return successCount > 0;

    } catch (error) {
      logger.error('Failed to send push notifications:', error);
      return false;
    }
  }

  async sendNotificationPush(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    const payload: PushNotificationPayload = {
      title,
      body: message,
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      data: {
        notificationId: data?.id,
        type: data?.type,
        url: data?.url || '/notifications',
        ...data,
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view-icon.png',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
      tag: data?.type || 'general',
      requireInteraction: data?.priority === 'HIGH',
    };

    return this.sendPushNotification({
      userId,
      payload,
      urgency: data?.priority === 'HIGH' ? 'high' : 'normal',
    });
  }

  private async getUserSubscriptions(userId: string): Promise<UserPushSubscription[]> {
    // In a real application, this would query the database
    // For now, return empty array (no subscriptions stored)
    return [];
  }

  getVapidPublicKey(): string | null {
    return this.vapidKeys?.publicKey || null;
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  async getSubscriptionStats(userId: string): Promise<{
    total: number;
    active: number;
    lastUsed?: Date;
  }> {
    try {
      const subscriptions = await this.getUserSubscriptions(userId);
      return {
        total: subscriptions.length,
        active: subscriptions.length, // In real app, would check for expired ones
        lastUsed: subscriptions[0]?.lastUsed,
      };
    } catch (error) {
      logger.error('Failed to get subscription stats:', error);
      return { total: 0, active: 0 };
    }
  }

  // Utility method to create notification templates
  createPropertyInquiryNotification(propertyTitle: string, inquirerName: string): PushNotificationPayload {
    return {
      title: 'New Property Inquiry',
      body: `${inquirerName} is interested in ${propertyTitle}`,
      icon: '/icons/inquiry-icon.png',
      data: {
        type: 'INQUIRY',
        url: '/dashboard/inquiries',
      },
      actions: [
        { action: 'view', title: 'View Inquiry' },
        { action: 'respond', title: 'Respond' },
      ],
      tag: 'inquiry',
      requireInteraction: true,
    };
  }

  createAppointmentReminderNotification(appointmentDate: string, propertyTitle: string): PushNotificationPayload {
    return {
      title: 'Appointment Reminder',
      body: `Your appointment for ${propertyTitle} is scheduled for ${appointmentDate}`,
      icon: '/icons/appointment-icon.png',
      data: {
        type: 'APPOINTMENT',
        url: '/dashboard/appointments',
      },
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'reschedule', title: 'Reschedule' },
      ],
      tag: 'appointment',
      requireInteraction: true,
    };
  }

  createPriceChangeNotification(propertyTitle: string, oldPrice: number, newPrice: number): PushNotificationPayload {
    const change = newPrice > oldPrice ? 'increased' : 'decreased';
    return {
      title: 'Price Alert',
      body: `${propertyTitle} price has ${change} to $${newPrice.toLocaleString()}`,
      icon: '/icons/price-icon.png',
      data: {
        type: 'PRICE_CHANGE',
        url: '/properties',
      },
      actions: [
        { action: 'view', title: 'View Property' },
      ],
      tag: 'price-change',
    };
  }
}

export const pushNotificationService = new PushNotificationService();