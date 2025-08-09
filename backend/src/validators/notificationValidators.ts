import { body, param, query } from 'express-validator';
import { NotificationType, NotificationChannel, NotificationPriority } from '@/types/notification';

// Common validations
export const notificationIdValidation = [
  param('notificationId')
    .isUUID()
    .withMessage('Notification ID must be a valid UUID')
];

export const userIdValidation = [
  body('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID')
];

export const templateIdValidation = [
  param('templateId')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Template ID must be a string between 1 and 100 characters')
];

export const campaignIdValidation = [
  param('campaignId')
    .isUUID()
    .withMessage('Campaign ID must be a valid UUID')
];

export const subscriptionIdValidation = [
  param('subscriptionId')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subscription ID must be a string between 1 and 100 characters')
];

// Pagination validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Send notification validation
export const sendNotificationValidation = [
  ...userIdValidation,

  body('type')
    .isIn(Object.values(NotificationType))
    .withMessage(`Type must be one of: ${Object.values(NotificationType).join(', ')}`),

  body('title')
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('message')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),

  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object'),

  body('channels')
    .isArray({ min: 1 })
    .withMessage('At least one channel must be specified')
    .custom((channels) => {
      const validChannels = Object.values(NotificationChannel);
      return channels.every((channel: string) => validChannels.includes(channel as NotificationChannel));
    })
    .withMessage(`Channels must be from: ${Object.values(NotificationChannel).join(', ')}`),

  body('priority')
    .optional()
    .isIn(Object.values(NotificationPriority))
    .withMessage(`Priority must be one of: ${Object.values(NotificationPriority).join(', ')}`),

  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),

  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (value) {
        const expiryDate = new Date(value);
        const scheduledDate = req.body.scheduledAt ? new Date(req.body.scheduledAt) : new Date();
        
        if (expiryDate <= scheduledDate) {
          throw new Error('Expiry date must be after scheduled date');
        }
      }
      return true;
    }),

  body('actionUrl')
    .optional()
    .isURL()
    .withMessage('Action URL must be a valid URL'),

  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return tags.every((tag: any) => typeof tag === 'string' && tag.length <= 50);
    })
    .withMessage('Each tag must be a string with maximum 50 characters'),

  body('category')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters')
];

// Bulk notification validation
export const sendBulkNotificationValidation = [
  body('notifications')
    .isArray({ min: 1, max: 1000 })
    .withMessage('Notifications array must contain 1-1000 items'),

  body('notifications.*.userId')
    .isUUID()
    .withMessage('Each notification must have a valid user ID'),

  body('notifications.*.type')
    .isIn(Object.values(NotificationType))
    .withMessage(`Each notification type must be one of: ${Object.values(NotificationType).join(', ')}`),

  body('notifications.*.title')
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each notification title must be between 1 and 200 characters'),

  body('notifications.*.message')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Each notification message must be between 1 and 1000 characters'),

  body('notifications.*.channels')
    .isArray({ min: 1 })
    .withMessage('Each notification must have at least one channel'),

  body('batchName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Batch name must be between 1 and 100 characters'),

  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date')
];

// Get notifications validation
export const getNotificationsValidation = [
  ...paginationValidation,

  query('type')
    .optional()
    .isIn(Object.values(NotificationType))
    .withMessage(`Type must be one of: ${Object.values(NotificationType).join(', ')}`),

  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean'),

  query('category')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),

  query('priority')
    .optional()
    .isIn(Object.values(NotificationPriority))
    .withMessage(`Priority must be one of: ${Object.values(NotificationPriority).join(', ')}`),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (value && req.query.startDate && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        return true; // Single tag
      }
      if (Array.isArray(value)) {
        return value.every(tag => typeof tag === 'string');
      }
      return false;
    })
    .withMessage('Tags must be a string or array of strings')
];

// Update preferences validation
export const updatePreferencesValidation = [
  body('email')
    .optional()
    .isBoolean()
    .withMessage('Email preference must be a boolean'),

  body('sms')
    .optional()
    .isBoolean()
    .withMessage('SMS preference must be a boolean'),

  body('push')
    .optional()
    .isBoolean()
    .withMessage('Push preference must be a boolean'),

  body('inApp')
    .optional()
    .isBoolean()
    .withMessage('In-app preference must be a boolean'),

  body('webhook')
    .optional()
    .isBoolean()
    .withMessage('Webhook preference must be a boolean'),

  body('types')
    .optional()
    .isObject()
    .withMessage('Types must be an object')
    .custom((types) => {
      if (types) {
        const validTypes = Object.values(NotificationType);
        const validChannels = ['email', 'sms', 'push', 'inApp', 'webhook'];
        
        for (const [type, channels] of Object.entries(types)) {
          if (!validTypes.includes(type as NotificationType)) {
            throw new Error(`Invalid notification type: ${type}`);
          }
          
          if (typeof channels !== 'object' || channels === null) {
            throw new Error(`Channels for type ${type} must be an object`);
          }
          
          for (const [channel, enabled] of Object.entries(channels as object)) {
            if (!validChannels.includes(channel)) {
              throw new Error(`Invalid channel: ${channel}`);
            }
            if (typeof enabled !== 'boolean') {
              throw new Error(`Channel ${channel} for type ${type} must be a boolean`);
            }
          }
        }
      }
      return true;
    }),

  body('quietHours')
    .optional()
    .isObject()
    .withMessage('Quiet hours must be an object'),

  body('quietHours.enabled')
    .optional()
    .isBoolean()
    .withMessage('Quiet hours enabled must be a boolean'),

  body('quietHours.start')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:mm format'),

  body('quietHours.end')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:mm format'),

  body('quietHours.timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a string'),

  body('quietHours.days')
    .optional()
    .isArray()
    .withMessage('Days must be an array')
    .custom((days) => {
      if (days && !days.every((day: any) => Number.isInteger(day) && day >= 0 && day <= 6)) {
        throw new Error('Days must be integers between 0 and 6');
      }
      return true;
    }),

  body('frequency')
    .optional()
    .isObject()
    .withMessage('Frequency must be an object'),

  body('frequency.digest')
    .optional()
    .isIn(['NEVER', 'DAILY', 'WEEKLY', 'MONTHLY'])
    .withMessage('Digest frequency must be NEVER, DAILY, WEEKLY, or MONTHLY'),

  body('frequency.marketing')
    .optional()
    .isIn(['NEVER', 'WEEKLY', 'MONTHLY'])
    .withMessage('Marketing frequency must be NEVER, WEEKLY, or MONTHLY'),

  body('frequency.reminders')
    .optional()
    .isBoolean()
    .withMessage('Reminders preference must be a boolean'),

  body('language')
    .optional()
    .isString()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language must be a 2-5 character language code'),

  body('webhookUrl')
    .optional()
    .isURL()
    .withMessage('Webhook URL must be a valid URL')
];

// Push subscription validation
export const subscribePushValidation = [
  body('endpoint')
    .isURL()
    .withMessage('Endpoint must be a valid URL'),

  body('keys')
    .isObject()
    .withMessage('Keys must be an object'),

  body('keys.p256dh')
    .isString()
    .isLength({ min: 1 })
    .withMessage('p256dh key is required'),

  body('keys.auth')
    .isString()
    .isLength({ min: 1 })
    .withMessage('auth key is required'),

  body('userAgent')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('User agent must be a string with maximum 500 characters')
];

// Test notification validation
export const testNotificationValidation = [
  ...userIdValidation,

  body('type')
    .isIn(Object.values(NotificationType))
    .withMessage(`Type must be one of: ${Object.values(NotificationType).join(', ')}`),

  body('channel')
    .isIn(Object.values(NotificationChannel))
    .withMessage(`Channel must be one of: ${Object.values(NotificationChannel).join(', ')}`),

  body('templateId')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Template ID must be between 1 and 100 characters'),

  body('testData')
    .optional()
    .isObject()
    .withMessage('Test data must be an object')
];

// Template validation
export const createTemplateValidation = [
  body('name')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('type')
    .isIn(Object.values(NotificationType))
    .withMessage(`Type must be one of: ${Object.values(NotificationType).join(', ')}`),

  body('channel')
    .isIn(Object.values(NotificationChannel))
    .withMessage(`Channel must be one of: ${Object.values(NotificationChannel).join(', ')}`),

  body('subject')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),

  body('template')
    .isString()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Template must be between 1 and 10000 characters'),

  body('variables')
    .isArray()
    .withMessage('Variables must be an array')
    .custom((variables) => {
      return variables.every((variable: any) => 
        typeof variable === 'string' && variable.length <= 50
      );
    })
    .withMessage('Each variable must be a string with maximum 50 characters'),

  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be maximum 500 characters'),

  body('previewData')
    .optional()
    .isObject()
    .withMessage('Preview data must be an object')
];

export const updateTemplateValidation = [
  ...templateIdValidation,

  body('name')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('subject')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),

  body('template')
    .optional()
    .isString()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Template must be between 1 and 10000 characters'),

  body('variables')
    .optional()
    .isArray()
    .withMessage('Variables must be an array'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be maximum 500 characters'),

  body('previewData')
    .optional()
    .isObject()
    .withMessage('Preview data must be an object')
];

export const getTemplatesValidation = [
  ...paginationValidation,

  query('type')
    .optional()
    .isIn(Object.values(NotificationType))
    .withMessage(`Type must be one of: ${Object.values(NotificationType).join(', ')}`),

  query('channel')
    .optional()
    .isIn(Object.values(NotificationChannel))
    .withMessage(`Channel must be one of: ${Object.values(NotificationChannel).join(', ')}`),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Campaign validation
export const createCampaignValidation = [
  body('name')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be maximum 500 characters'),

  body('type')
    .isIn(Object.values(NotificationType))
    .withMessage(`Type must be one of: ${Object.values(NotificationType).join(', ')}`),

  body('channels')
    .isArray({ min: 1 })
    .withMessage('At least one channel must be specified')
    .custom((channels) => {
      const validChannels = Object.values(NotificationChannel);
      return channels.every((channel: string) => validChannels.includes(channel as NotificationChannel));
    })
    .withMessage(`Channels must be from: ${Object.values(NotificationChannel).join(', ')}`),

  body('targetAudience')
    .isObject()
    .withMessage('Target audience must be an object'),

  body('targetAudience.userIds')
    .optional()
    .isArray()
    .withMessage('User IDs must be an array')
    .custom((userIds) => {
      if (userIds && userIds.length > 10000) {
        throw new Error('Maximum 10000 user IDs allowed');
      }
      return !userIds || userIds.every((id: any) => typeof id === 'string');
    })
    .withMessage('Each user ID must be a string'),

  body('template')
    .isObject()
    .withMessage('Template must be an object'),

  body('template.title')
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Template title must be between 1 and 200 characters'),

  body('template.message')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Template message must be between 1 and 1000 characters'),

  body('schedule')
    .isObject()
    .withMessage('Schedule must be an object'),

  body('schedule.type')
    .isIn(['IMMEDIATE', 'SCHEDULED', 'RECURRING'])
    .withMessage('Schedule type must be IMMEDIATE, SCHEDULED, or RECURRING'),

  body('schedule.scheduledAt')
    .if(body('schedule.type').equals('SCHEDULED'))
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),

  body('schedule.recurring')
    .if(body('schedule.type').equals('RECURRING'))
    .isObject()
    .withMessage('Recurring schedule must be an object'),

  body('schedule.recurring.frequency')
    .if(body('schedule.type').equals('RECURRING'))
    .isIn(['DAILY', 'WEEKLY', 'MONTHLY'])
    .withMessage('Recurring frequency must be DAILY, WEEKLY, or MONTHLY'),

  body('schedule.recurring.interval')
    .if(body('schedule.type').equals('RECURRING'))
    .isInt({ min: 1, max: 365 })
    .withMessage('Recurring interval must be between 1 and 365')
];

export const getCampaignsValidation = [
  ...paginationValidation,

  query('status')
    .optional()
    .isIn(['DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED', 'FAILED'])
    .withMessage('Status must be DRAFT, SCHEDULED, RUNNING, COMPLETED, CANCELLED, or FAILED'),

  query('type')
    .optional()
    .isIn(Object.values(NotificationType))
    .withMessage(`Type must be one of: ${Object.values(NotificationType).join(', ')}`)
];

// Statistics validation
export const getStatsValidation = [
  query('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  query('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('Group by must be day, week, or month'),

  query('channels')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        return Object.values(NotificationChannel).includes(value as NotificationChannel);
      }
      if (Array.isArray(value)) {
        return value.every(channel => Object.values(NotificationChannel).includes(channel));
      }
      return false;
    })
    .withMessage(`Channels must be from: ${Object.values(NotificationChannel).join(', ')}`),

  query('types')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        return Object.values(NotificationType).includes(value as NotificationType);
      }
      if (Array.isArray(value)) {
        return value.every(type => Object.values(NotificationType).includes(type));
      }
      return false;
    })
    .withMessage(`Types must be from: ${Object.values(NotificationType).join(', ')}`)
];

// Date range validation helper
export const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (value && req.query.startDate && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// Common ID validation
export const idValidation = [
  param('id')
    .isUUID()
    .withMessage('ID must be a valid UUID')
];