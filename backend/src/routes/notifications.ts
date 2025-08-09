import { Router } from 'express';
import { notificationController } from '@/controllers/notificationController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import {
  sendNotificationValidation,
  sendBulkNotificationValidation,
  getNotificationsValidation,
  updatePreferencesValidation,
  subscribePushValidation,
  testNotificationValidation,
  createTemplateValidation,
  updateTemplateValidation,
  getTemplatesValidation,
  createCampaignValidation,
  getCampaignsValidation,
  getStatsValidation,
  notificationIdValidation,
  templateIdValidation,
  campaignIdValidation,
  subscriptionIdValidation,
  paginationValidation
} from '@/validators/notificationValidators';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationData:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - title
 *         - message
 *         - channels
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user to receive the notification
 *         type:
 *           type: string
 *           enum: [PROPERTY_INQUIRY, APPOINTMENT_SCHEDULED, PROPERTY_APPROVED, etc.]
 *           description: Type of notification
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Notification title
 *         message:
 *           type: string
 *           maxLength: 1000
 *           description: Notification message
 *         data:
 *           type: object
 *           description: Additional data for the notification
 *         channels:
 *           type: array
 *           items:
 *             type: string
 *             enum: [EMAIL, SMS, PUSH, IN_APP, WEBHOOK]
 *           description: Channels to send the notification through
 *         priority:
 *           type: string
 *           enum: [LOW, NORMAL, HIGH, URGENT]
 *           default: NORMAL
 *           description: Notification priority
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           description: When to send the notification (optional)
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: When the notification expires (optional)
 *         actionUrl:
 *           type: string
 *           format: uri
 *           description: URL for notification action (optional)
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: Image URL for the notification (optional)
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 10
 *           description: Tags for categorizing the notification
 *         category:
 *           type: string
 *           maxLength: 50
 *           description: Notification category
 *
 *     NotificationPreferences:
 *       type: object
 *       properties:
 *         email:
 *           type: boolean
 *           description: Enable email notifications
 *         sms:
 *           type: boolean
 *           description: Enable SMS notifications
 *         push:
 *           type: boolean
 *           description: Enable push notifications
 *         inApp:
 *           type: boolean
 *           description: Enable in-app notifications
 *         webhook:
 *           type: boolean
 *           description: Enable webhook notifications
 *         types:
 *           type: object
 *           description: Per-type notification preferences
 *         quietHours:
 *           type: object
 *           properties:
 *             enabled:
 *               type: boolean
 *             start:
 *               type: string
 *               pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *             end:
 *               type: string
 *               pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *             timezone:
 *               type: string
 *             days:
 *               type: array
 *               items:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *         frequency:
 *           type: object
 *           properties:
 *             digest:
 *               type: string
 *               enum: [NEVER, DAILY, WEEKLY, MONTHLY]
 *             marketing:
 *               type: string
 *               enum: [NEVER, WEEKLY, MONTHLY]
 *             reminders:
 *               type: boolean
 *         language:
 *           type: string
 *           minLength: 2
 *           maxLength: 5
 *         webhookUrl:
 *           type: string
 *           format: uri
 */

// Send single notification
/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send a single notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationData'
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       202:
 *         description: Notification scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     notificationId:
 *                       type: string
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/send',
  authenticate,
  authorize(['admin', 'agent']),
  sendNotificationValidation,
  validate,
  notificationController.sendNotification
);

// Send bulk notifications
/**
 * @swagger
 * /api/notifications/send/bulk:
 *   post:
 *     summary: Send bulk notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notifications
 *             properties:
 *               notifications:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/NotificationData'
 *                 minItems: 1
 *                 maxItems: 1000
 *               batchName:
 *                 type: string
 *                 maxLength: 100
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Bulk notifications sent successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/send/bulk',
  authenticate,
  authorize(['admin']),
  sendBulkNotificationValidation,
  validate,
  notificationController.sendBulkNotifications
);

// Get user notifications
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PROPERTY_INQUIRY, APPOINTMENT_SCHEDULED, etc.]
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, NORMAL, HIGH, URGENT]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                     summary:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authenticate,
  getNotificationsValidation,
  validate,
  notificationController.getNotifications
);

// Mark notification as read
/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch(
  '/:notificationId/read',
  authenticate,
  notificationIdValidation,
  validate,
  notificationController.markAsRead
);

// Mark all notifications as read
/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.patch(
  '/read-all',
  authenticate,
  notificationController.markAllAsRead
);

// Get notification preferences
/**
 * @swagger
 * /api/notifications/preferences:
 *   get:
 *     summary: Get user notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreferences'
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/preferences',
  authenticate,
  notificationController.getPreferences
);

// Update notification preferences
/**
 * @swagger
 * /api/notifications/preferences:
 *   put:
 *     summary: Update user notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationPreferences'
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/preferences',
  authenticate,
  updatePreferencesValidation,
  validate,
  notificationController.updatePreferences
);

// Get notification statistics
/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: Get notification statistics
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *       - in: query
 *         name: channels
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [EMAIL, SMS, PUSH, IN_APP, WEBHOOK]
 *       - in: query
 *         name: types
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/stats',
  authenticate,
  authorize(['admin', 'agent']),
  getStatsValidation,
  validate,
  notificationController.getStats
);

// Subscribe to push notifications
/**
 * @swagger
 * /api/notifications/push/subscribe:
 *   post:
 *     summary: Subscribe to push notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *               - keys
 *             properties:
 *               endpoint:
 *                 type: string
 *                 format: uri
 *               keys:
 *                 type: object
 *                 required:
 *                   - p256dh
 *                   - auth
 *                 properties:
 *                   p256dh:
 *                     type: string
 *                   auth:
 *                     type: string
 *               userAgent:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Push subscription created
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/push/subscribe',
  authenticate,
  subscribePushValidation,
  validate,
  notificationController.subscribePush
);

// Unsubscribe from push notifications
/**
 * @swagger
 * /api/notifications/push/unsubscribe/{subscriptionId}:
 *   delete:
 *     summary: Unsubscribe from push notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Push subscription removed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscription not found
 */
router.delete(
  '/push/unsubscribe/:subscriptionId',
  authenticate,
  subscriptionIdValidation,
  validate,
  notificationController.unsubscribePush
);

// Test notification
/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Send a test notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - channel
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [PROPERTY_INQUIRY, APPOINTMENT_SCHEDULED, etc.]
 *               channel:
 *                 type: string
 *                 enum: [EMAIL, SMS, PUSH, IN_APP, WEBHOOK]
 *               templateId:
 *                 type: string
 *               testData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Test notification sent
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/test',
  authenticate,
  authorize(['admin', 'agent']),
  testNotificationValidation,
  validate,
  notificationController.testNotification
);

// Admin routes for templates
/**
 * @swagger
 * /api/notifications/templates:
 *   get:
 *     summary: Get notification templates (Admin only)
 *     tags: [Notifications - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/templates',
  authenticate,
  authorize(['admin']),
  getTemplatesValidation,
  validate,
  notificationController.getTemplates
);

/**
 * @swagger
 * /api/notifications/templates:
 *   post:
 *     summary: Create notification template (Admin only)
 *     tags: [Notifications - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - channel
 *               - template
 *               - variables
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               type:
 *                 type: string
 *               channel:
 *                 type: string
 *               subject:
 *                 type: string
 *                 maxLength: 200
 *               template:
 *                 type: string
 *                 maxLength: 10000
 *               variables:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               previewData:
 *                 type: object
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/templates',
  authenticate,
  authorize(['admin']),
  createTemplateValidation,
  validate,
  notificationController.createTemplate
);

/**
 * @swagger
 * /api/notifications/templates/{templateId}:
 *   put:
 *     summary: Update notification template (Admin only)
 *     tags: [Notifications - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               subject:
 *                 type: string
 *                 maxLength: 200
 *               template:
 *                 type: string
 *                 maxLength: 10000
 *               variables:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               previewData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Template not found
 */
router.put(
  '/templates/:templateId',
  authenticate,
  authorize(['admin']),
  updateTemplateValidation,
  validate,
  notificationController.updateTemplate
);

/**
 * @swagger
 * /api/notifications/templates/{templateId}:
 *   delete:
 *     summary: Delete notification template (Admin only)
 *     tags: [Notifications - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Template not found
 */
router.delete(
  '/templates/:templateId',
  authenticate,
  authorize(['admin']),
  templateIdValidation,
  validate,
  notificationController.deleteTemplate
);

// Admin routes for campaigns
/**
 * @swagger
 * /api/notifications/campaigns:
 *   get:
 *     summary: Get notification campaigns (Admin only)
 *     tags: [Notifications - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, SCHEDULED, RUNNING, COMPLETED, CANCELLED, FAILED]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaigns retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/campaigns',
  authenticate,
  authorize(['admin']),
  getCampaignsValidation,
  validate,
  notificationController.getCampaigns
);

/**
 * @swagger
 * /api/notifications/campaigns:
 *   post:
 *     summary: Create notification campaign (Admin only)
 *     tags: [Notifications - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - channels
 *               - targetAudience
 *               - template
 *               - schedule
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               type:
 *                 type: string
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *               targetAudience:
 *                 type: object
 *               template:
 *                 type: object
 *               schedule:
 *                 type: object
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/campaigns',
  authenticate,
  authorize(['admin']),
  createCampaignValidation,
  validate,
  notificationController.createCampaign
);

// System health endpoint
/**
 * @swagger
 * /api/notifications/health:
 *   get:
 *     summary: Get notification system health
 *     tags: [Notifications - System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, degraded, unhealthy]
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     services:
 *                       type: object
 *                     metrics:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/health',
  authenticate,
  authorize(['admin']),
  notificationController.getHealth
);

export default router;