import { EventEmitter } from 'events';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import Redis from 'ioredis';
import { logger } from '@/utils/logger';
import { AppError } from '@/utils/errors';
import { config } from '@/config/database';
import { v4 as uuidv4 } from 'uuid';
import { NotificationType } from '../types/property';

const { cache } = config;

// Notification channels
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
  WEBHOOK = 'WEBHOOK'
}

// Notification priority
export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface NotificationData {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  scheduledAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  template: string;
  variables: string[];
  isActive: boolean;
}

export interface EmailConfig {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

export interface SMSConfig {
  to: string;
  message: string;
}

export interface PushConfig {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  badge?: number;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  types: Partial<Record<NotificationType, {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  }>>;
  quietHours?: {
    start: string; // HH:mm format
    end: string;   // HH:mm format
    timezone: string;
  };
}

class NotificationService extends EventEmitter {
  private emailTransporter: nodemailer.Transporter;
  private twilioClient: twilio.Twilio;
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    super();
    this.initializeEmailTransporter();
    this.initializeTwilioClient();
    this.loadTemplates();
    this.setupEventListeners();
  }

  private initializeEmailTransporter(): void {
    try {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100
      });

      // Verify connection
      this.emailTransporter.verify((error) => {
        if (error) {
          logger.error('Email transporter verification failed:', error);
        } else {
          logger.info('Email transporter is ready');
        }
      });
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  private initializeTwilioClient(): void {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (accountSid && authToken) {
        this.twilioClient = twilio(accountSid, authToken);
        logger.info('Twilio client initialized');
      } else {
        logger.warn('Twilio credentials not provided, SMS notifications disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize Twilio client:', error);
    }
  }

  private async loadTemplates(): Promise<void> {
    try {
      // Load templates from database or configuration
      // This is a placeholder - implement with your data source
      const defaultTemplates: NotificationTemplate[] = [
        {
          id: 'welcome-email',
          type: NotificationType.WELCOME,
          channel: NotificationChannel.EMAIL,
          subject: 'Welcome to RealEstate Platform!',
          template: `
            <h1>Welcome {{firstName}}!</h1>
            <p>Thank you for joining our real estate platform. We're excited to help you find your dream property.</p>
            <p>Get started by exploring our latest listings or setting up your property preferences.</p>
            <a href="{{platformUrl}}/dashboard" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
          `,
          variables: ['firstName', 'platformUrl'],
          isActive: true
        },
        {
          id: 'email-verification',
          type: 'EMAIL_VERIFICATION' as NotificationType,
          channel: NotificationChannel.EMAIL,
          subject: 'Verify Your Email Address - Kenya Real Estate',
          template: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2c3e50;">Verify Your Email Address</h1>
              <p>Thank you for registering with Kenya Real Estate Platform!</p>
              <p>To complete your registration and start browsing unlimited properties, please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{verificationUrl}}" style="background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #3498db;">{{verificationUrl}}</p>
              <p style="color: #7f8c8d; font-size: 14px;">This verification link will expire in 24 hours for security reasons.</p>
              <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
              <p style="color: #7f8c8d; font-size: 12px;">If you didn't create an account with us, please ignore this email.</p>
            </div>
          `,
          variables: ['verificationUrl'],
          isActive: true
        },
        {
          id: 'property-inquiry-email',
          type: NotificationType.PROPERTY_INQUIRY,
          channel: NotificationChannel.EMAIL,
          subject: 'New Inquiry for Your Property',
          template: `
            <h2>New Property Inquiry</h2>
            <p>You have received a new inquiry for your property: <strong>{{propertyTitle}}</strong></p>
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
              <p><strong>From:</strong> {{inquirerName}} ({{inquirerEmail}})</p>
              <p><strong>Phone:</strong> {{inquirerPhone}}</p>
              <p><strong>Message:</strong></p>
              <p>{{inquiryMessage}}</p>
            </div>
            <a href="{{propertyUrl}}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Property</a>
          `,
          variables: ['propertyTitle', 'inquirerName', 'inquirerEmail', 'inquirerPhone', 'inquiryMessage', 'propertyUrl'],
          isActive: true
        }
      ];

      for (const template of defaultTemplates) {
        this.templates.set(`${template.type}-${template.channel}`, template);
      }

      logger.info(`Loaded ${defaultTemplates.length} notification templates`);
    } catch (error) {
      logger.error('Failed to load notification templates:', error);
    }
  }

  private setupEventListeners(): void {
    // Listen for property events
    this.on('property:inquiry', this.handlePropertyInquiry.bind(this));
    this.on('property:approved', this.handlePropertyApproved.bind(this));
    this.on('property:rejected', this.handlePropertyRejected.bind(this));
    
    // Listen for user events
    this.on('user:registered', this.handleUserRegistered.bind(this));
    this.on('user:verified', this.handleUserVerified.bind(this));
    
    // Listen for appointment events
    this.on('appointment:scheduled', this.handleAppointmentScheduled.bind(this));
    this.on('appointment:reminder', this.handleAppointmentReminder.bind(this));
  }

  // Main notification sending method
  public async sendNotification(notificationData: NotificationData): Promise<void> {
    try {
      const notificationId = notificationData.id || uuidv4();
      
      // Check user preferences
      const preferences = await this.getUserPreferences(notificationData.userId);
      const filteredChannels = this.filterChannelsByPreferences(
        notificationData.channels,
        notificationData.type,
        preferences
      );

      if (filteredChannels.length === 0) {
        logger.info(`No enabled channels for user ${notificationData.userId}, notification type ${notificationData.type}`);
        return;
      }

      // Check quiet hours
      if (this.isInQuietHours(preferences)) {
        await this.scheduleNotification(notificationData, new Date(Date.now() + this.getQuietHoursDelay(preferences)));
        return;
      }

      // Send through each channel
      const promises = filteredChannels.map(channel => 
        this.sendThroughChannel(channel, notificationData, notificationId)
      );

      await Promise.allSettled(promises);

      // Store notification in database for in-app display
      if (filteredChannels.includes(NotificationChannel.IN_APP)) {
        await this.storeInAppNotification(notificationData, notificationId);
      }

      logger.info(`Notification sent: ${notificationId} to user ${notificationData.userId}`);
    } catch (error) {
      logger.error('Failed to send notification:', error);
      throw new AppError('Failed to send notification', 500);
    }
  }

  // Send through specific channel
  private async sendThroughChannel(
    channel: NotificationChannel,
    notificationData: NotificationData,
    notificationId: string
  ): Promise<void> {
    try {
      switch (channel) {
        case NotificationChannel.EMAIL:
          await this.sendEmail(notificationData, notificationId);
          break;
        case NotificationChannel.SMS:
          await this.sendSMS(notificationData, notificationId);
          break;
        case NotificationChannel.PUSH:
          await this.sendPushNotification(notificationData, notificationId);
          break;
        case NotificationChannel.IN_APP:
          // Handled separately in main method
          break;
        case NotificationChannel.WEBHOOK:
          await this.sendWebhook(notificationData, notificationId);
          break;
        default:
          logger.warn(`Unknown notification channel: ${channel}`);
      }
    } catch (error) {
      logger.error(`Failed to send notification through ${channel}:`, error);
    }
  }

  // Email sending
  private async sendEmail(notificationData: NotificationData, notificationId: string): Promise<void> {
    try {
      const user = await this.getUserDetails(notificationData.userId);
      const template = this.getTemplate(notificationData.type, NotificationChannel.EMAIL);
      
      if (!template) {
        throw new Error(`No email template found for ${notificationData.type}`);
      }

      const renderedContent = this.renderTemplate(template.template, {
        ...notificationData.data,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });

      const emailConfig: EmailConfig = {
        to: user.email,
        subject: template.subject || notificationData.title,
        html: renderedContent,
        text: this.stripHtml(renderedContent)
      };

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@realestate.com',
        ...emailConfig,
        headers: {
          'X-Notification-ID': notificationId,
          'X-Notification-Type': notificationData.type
        }
      });

      logger.info(`Email sent: ${notificationId} to ${user.email}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  // SMS sending
  private async sendSMS(notificationData: NotificationData, notificationId: string): Promise<void> {
    try {
      if (!this.twilioClient) {
        throw new Error('Twilio client not initialized');
      }

      const user = await this.getUserDetails(notificationData.userId);
      
      if (!user.phone) {
        throw new Error('User phone number not available');
      }

      const template = this.getTemplate(notificationData.type, NotificationChannel.SMS);
      const message = template 
        ? this.renderTemplate(template.template, notificationData.data)
        : notificationData.message;

      await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phone
      });

      logger.info(`SMS sent: ${notificationId} to ${user.phone}`);
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      throw error;
    }
  }

  // Push notification sending
  private async sendPushNotification(notificationData: NotificationData, notificationId: string): Promise<void> {
    try {
      // This would integrate with Firebase Cloud Messaging, Apple Push Notification Service, etc.
      // For now, we'll store it for WebSocket delivery
      
      const pushData = {
        id: notificationId,
        userId: notificationData.userId,
        title: notificationData.title,
        body: notificationData.message,
        data: notificationData.data,
        timestamp: new Date().toISOString()
      };

      // Store in Redis for real-time delivery
        await config.redis.lpush(`push:${notificationData.userId}`, JSON.stringify(pushData));
        await config.redis.expire(`push:${notificationData.userId}`, 86400); // 24 hours

      // Emit event for WebSocket delivery
      this.emit('push:notification', pushData);

      logger.info(`Push notification queued: ${notificationId} for user ${notificationData.userId}`);
    } catch (error) {
      logger.error('Failed to send push notification:', error);
      throw error;
    }
  }

  // Webhook sending
  private async sendWebhook(notificationData: NotificationData, notificationId: string): Promise<void> {
    try {
      const webhookUrl = await this.getUserWebhookUrl(notificationData.userId);
      
      if (!webhookUrl) {
        return; // No webhook configured
      }

      const payload = {
        id: notificationId,
        type: notificationData.type,
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Notification-ID': notificationId,
          'X-Notification-Type': notificationData.type
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      logger.info(`Webhook sent: ${notificationId} to ${webhookUrl}`);
    } catch (error) {
      logger.error('Failed to send webhook:', error);
      throw error;
    }
  }

  // Schedule notification for later delivery
  public async scheduleNotification(notificationData: NotificationData, scheduledAt: Date): Promise<string> {
    try {
      const notificationId = notificationData.id || uuidv4();
      const delay = scheduledAt.getTime() - Date.now();

      if (delay <= 0) {
        // Send immediately if scheduled time has passed
        await this.sendNotification(notificationData);
        return notificationId;
      }

      // Store in Redis with expiration
      const scheduledData = {
        ...notificationData,
        id: notificationId,
        scheduledAt: scheduledAt.toISOString()
      };

      await config.redis.setex(
        `scheduled:${notificationId}`,
        Math.ceil((scheduledAt.getTime() - Date.now()) / 1000),
        JSON.stringify(scheduledData)
      );

      // Set up timer for delivery
      setTimeout(async () => {
        try {
          const storedData = await config.redis.get(`scheduled:${notificationId}`);
          if (storedData) {
            const notification = JSON.parse(storedData);
            await this.sendNotification(notification);
            await config.redis.del(`scheduled:${notificationId}`);
          }
        } catch (error) {
          logger.error(`Failed to send scheduled notification ${notificationId}:`, error);
        }
      }, delay);

      logger.info(`Notification scheduled: ${notificationId} for ${scheduledAt.toISOString()}`);
      return notificationId;
    } catch (error) {
      logger.error('Failed to schedule notification:', error);
      throw new AppError('Failed to schedule notification', 500);
    }
  }

  // Bulk notification sending
  public async sendBulkNotifications(notifications: NotificationData[]): Promise<void> {
    try {
      const batchSize = 100;
      const batches = [];

      for (let i = 0; i < notifications.length; i += batchSize) {
        batches.push(notifications.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const promises = batch.map(notification => 
          this.sendNotification(notification).catch(error => {
            logger.error(`Failed to send bulk notification to user ${notification.userId}:`, error);
          })
        );

        await Promise.allSettled(promises);
        
        // Small delay between batches to avoid overwhelming services
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      logger.info(`Bulk notifications sent: ${notifications.length} notifications`);
    } catch (error) {
      logger.error('Failed to send bulk notifications:', error);
      throw new AppError('Failed to send bulk notifications', 500);
    }
  }

  // Event handlers
  private async handlePropertyInquiry(data: any): Promise<void> {
    await this.sendNotification({
      userId: data.agentId,
      type: NotificationType.PROPERTY_INQUIRY,
      title: 'New Property Inquiry',
      message: `You have a new inquiry for ${data.propertyTitle}`,
      data,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP, NotificationChannel.PUSH],
      priority: NotificationPriority.HIGH
    });
  }

  private async handleUserRegistered(data: any): Promise<void> {
    await this.sendNotification({
      userId: data.userId,
      type: NotificationType.WELCOME,
      title: 'Welcome to RealEstate Platform!',
      message: 'Thank you for joining us. Start exploring properties now!',
      data,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      priority: NotificationPriority.NORMAL
    });
  }

  private async handleAppointmentScheduled(data: any): Promise<void> {
    // Notify agent
    await this.sendNotification({
      userId: data.agentId,
      type: NotificationType.APPOINTMENT_SCHEDULED,
      title: 'New Appointment Scheduled',
      message: `Appointment scheduled for ${data.propertyTitle} on ${data.appointmentDate}`,
      data,
      channels: [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.IN_APP],
      priority: NotificationPriority.HIGH
    });

    // Notify client
    await this.sendNotification({
      userId: data.clientId,
      type: NotificationType.APPOINTMENT_SCHEDULED,
      title: 'Appointment Confirmed',
      message: `Your appointment for ${data.propertyTitle} is confirmed for ${data.appointmentDate}`,
      data,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      priority: NotificationPriority.NORMAL
    });
  }

  private async handlePropertyApproved(data: any): Promise<void> {
    await this.sendNotification({
      userId: data.agentId,
      type: NotificationType.PROPERTY_APPROVED,
      title: 'Property Approved',
      message: `Your property "${data.propertyTitle}" has been approved and is now live!`,
      data,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP, NotificationChannel.PUSH],
      priority: NotificationPriority.NORMAL
    });
  }

  private async handlePropertyRejected(data: any): Promise<void> {
    await this.sendNotification({
      userId: data.agentId,
      type: NotificationType.PROPERTY_REJECTED,
      title: 'Property Needs Review',
      message: `Your property "${data.propertyTitle}" needs some updates before approval.`,
      data,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      priority: NotificationPriority.NORMAL
    });
  }

  private async handleAppointmentReminder(data: any): Promise<void> {
    await this.sendNotification({
      userId: data.userId,
      type: NotificationType.APPOINTMENT_REMINDER,
      title: 'Appointment Reminder',
      message: `Reminder: You have an appointment for ${data.propertyTitle} in ${data.timeUntil}`,
      data,
      channels: [NotificationChannel.SMS, NotificationChannel.PUSH],
      priority: NotificationPriority.HIGH
    });
  }

  private async handleUserVerified(data: any): Promise<void> {
    await this.sendNotification({
      userId: data.userId,
      type: NotificationType.ACCOUNT_VERIFIED,
      title: 'Account Verified',
      message: 'Your account has been successfully verified. You can now access all features!',
      data,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      priority: NotificationPriority.NORMAL
    });
  }

  // Utility methods
  private async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      // This would fetch from database
      // Placeholder implementation
      return {
        userId,
        email: true,
        sms: true,
        push: true,
        inApp: true,
        types: {}
      };
    } catch (error) {
      logger.error('Failed to get user preferences:', error);
      // Return default preferences
      return {
        userId,
        email: true,
        sms: false,
        push: true,
        inApp: true,
        types: {}
      };
    }
  }

  private async getUserDetails(userId: string): Promise<any> {
    // This would fetch from database
    // Placeholder implementation
    return {
      id: userId,
      firstName: 'User',
      lastName: 'Name',
      email: 'user@example.com',
      phone: '+1234567890'
    };
  }

  private async getUserWebhookUrl(userId: string): Promise<string | null> {
    // This would fetch from database
    // Placeholder implementation
    return null;
  }

  private filterChannelsByPreferences(
    channels: NotificationChannel[],
    type: NotificationType,
    preferences: NotificationPreferences
  ): NotificationChannel[] {
    return channels.filter(channel => {
      // Check type-specific preferences first
      if (preferences.types[type]) {
        const typePrefs = preferences.types[type];
        switch (channel) {
          case NotificationChannel.EMAIL:
            return typePrefs.email;
          case NotificationChannel.SMS:
            return typePrefs.sms;
          case NotificationChannel.PUSH:
            return typePrefs.push;
          case NotificationChannel.IN_APP:
            return typePrefs.inApp;
          default:
            return true;
        }
      }

      // Fall back to global preferences
      switch (channel) {
        case NotificationChannel.EMAIL:
          return preferences.email;
        case NotificationChannel.SMS:
          return preferences.sms;
        case NotificationChannel.PUSH:
          return preferences.push;
        case NotificationChannel.IN_APP:
          return preferences.inApp;
        default:
          return true;
      }
    });
  }

  private isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours) {
      return false;
    }

    const now = new Date();
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: preferences.quietHours.timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }).format(now);

    const currentTime = userTime.replace(':', '');
    const startTime = preferences.quietHours.start.replace(':', '');
    const endTime = preferences.quietHours.end.replace(':', '');

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private getQuietHoursDelay(preferences: NotificationPreferences): number {
    if (!preferences.quietHours) {
      return 0;
    }

    // Calculate delay until quiet hours end
    // This is a simplified implementation
    return 8 * 60 * 60 * 1000; // 8 hours in milliseconds
  }

  private getTemplate(type: NotificationType, channel: NotificationChannel): NotificationTemplate | undefined {
    return this.templates.get(`${type}-${channel}`);
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template;
    
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value || ''));
    }

    return rendered;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  private async storeInAppNotification(notificationData: NotificationData, notificationId: string): Promise<void> {
    try {
      // Store in database for in-app notifications
      // This is a placeholder - implement with your ORM
      const inAppNotification = {
        id: notificationId,
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data,
        isRead: false,
        createdAt: new Date(),
        expiresAt: notificationData.expiresAt
      };

      // Also store in Redis for quick access
      await config.redis.lpush(
        `notifications:${notificationData.userId}`,
        JSON.stringify(inAppNotification)
      );
      await config.redis.ltrim(`notifications:${notificationData.userId}`, 0, 99); // Keep last 100
      await config.redis.expire(`notifications:${notificationData.userId}`, 2592000); // 30 days

      logger.info(`In-app notification stored: ${notificationId}`);
    } catch (error) {
      logger.error('Failed to store in-app notification:', error);
    }
  }

  // Public methods for external use
  public async getInAppNotifications(userId: string, page: number = 1, limit: number = 20): Promise<{
    notifications: any[];
    total: number;
    unreadCount: number;
  }> {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const notifications = await config.redis.lrange(`notifications:${userId}`, start, end);
      const total = await config.redis.llen(`notifications:${userId}`);
      
      const parsedNotifications = notifications.map(n => JSON.parse(n));
      const unreadCount = parsedNotifications.filter(n => !n.isRead).length;

      return {
        notifications: parsedNotifications,
        total,
        unreadCount
      };
    } catch (error) {
      logger.error('Failed to get in-app notifications:', error);
      return { notifications: [], total: 0, unreadCount: 0 };
    }
  }

  public async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      // Update in database
      // This is a placeholder - implement with your ORM

      // Update in Redis cache
      const notifications = await config.redis.lrange(`notifications:${userId}`, 0, -1);
      const updatedNotifications = notifications.map(notificationStr => {
        const notification = JSON.parse(notificationStr);
        if (notification.id === notificationId) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }
        return JSON.stringify(notification);
      });

      await config.redis.del(`notifications:${userId}`);
      if (updatedNotifications.length > 0) {
        await config.redis.lpush(`notifications:${userId}`, ...updatedNotifications);
        await config.redis.expire(`notifications:${userId}`, 2592000);
      }

      logger.info(`Notification marked as read: ${notificationId}`);
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      throw new AppError('Failed to mark notification as read', 500);
    }
  }

  public async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      // Update in database
      // This is a placeholder - implement with your ORM
      
      logger.info(`Notification preferences updated for user: ${userId}`);
    } catch (error) {
      logger.error('Failed to update notification preferences:', error);
      throw new AppError('Failed to update notification preferences', 500);
    }
  }
}

export const notificationService = new NotificationService();