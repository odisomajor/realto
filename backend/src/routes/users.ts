import { Router } from 'express';
const userController = require('../controllers/userController.js');
import { authenticate, authorize, optionalAuthenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import {
  userIdValidation,
  updateProfileValidation,
  updateUserValidation,
  searchUsersValidation,
  updatePreferencesValidation,
  changePasswordValidation,
  uploadAvatarValidation,
  activityValidation,
  agentsValidation,
  notificationIdValidation,
  sessionIdValidation,
  bulkOperationValidation,
  userImportValidation,
  paginationValidation,
  dateRangeValidation,
  analyticsPeriodValidation
} from '@/validators/userValidators';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         avatar:
 *           type: string
 *           format: uri
 *         role:
 *           type: string
 *           enum: [USER, AGENT, ADMIN, SUPER_ADMIN]
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED, PENDING]
 *         bio:
 *           type: string
 *         specialties:
 *           type: array
 *           items:
 *             type: string
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *         licenseNumber:
 *           type: string
 *         yearsOfExperience:
 *           type: integer
 *         agency:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             logo:
 *               type: string
 *               format: uri
 *         socialMedia:
 *           type: object
 *           properties:
 *             facebook:
 *               type: string
 *               format: uri
 *             twitter:
 *               type: string
 *               format: uri
 *             linkedin:
 *               type: string
 *               format: uri
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserPreferences:
 *       type: object
 *       properties:
 *         searchPreferences:
 *           type: object
 *         notificationSettings:
 *           type: object
 *           properties:
 *             email:
 *               type: boolean
 *             sms:
 *               type: boolean
 *             push:
 *               type: boolean
 *             marketing:
 *               type: boolean
 *         displaySettings:
 *           type: object
 *           properties:
 *             theme:
 *               type: string
 *               enum: [light, dark, auto]
 *             language:
 *               type: string
 *             currency:
 *               type: string
 *         privacySettings:
 *           type: object
 *           properties:
 *             showEmail:
 *               type: boolean
 *             showPhone:
 *               type: boolean
 *             allowDirectMessages:
 *               type: boolean
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/profile',
  authenticate,
  userController.getProfile
);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               bio:
 *                 type: string
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               licenseNumber:
 *                 type: string
 *               yearsOfExperience:
 *                 type: integer
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               socialMedia:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/profile',
  authenticate,
  updateProfileValidation,
  validate,
  userController.updateProfile
);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, AGENT, ADMIN, SUPER_ADMIN]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED, PENDING]
 *       - in: query
 *         name: agencyId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: specialties
 *         schema:
 *           type: string
 *         description: Comma-separated specialties
 *       - in: query
 *         name: languages
 *         schema:
 *           type: string
 *         description: Comma-separated languages
 *       - in: query
 *         name: minExperience
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxExperience
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, firstName, lastName, yearsOfExperience, lastLoginAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get(
  '/search',
  optionalAuthenticate,
  searchUsersValidation,
  validate,
  userController.searchUsers
);

/**
 * @swagger
 * /api/users/agents:
 *   get:
 *     summary: Get agents list
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: agencyId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Agents retrieved successfully
 */
router.get(
  '/agents',
  optionalAuthenticate,
  agentsValidation,
  validate,
  userController.getAgents
);

/**
 * @swagger
 * /api/users/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Users]
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
 *                   $ref: '#/components/schemas/UserPreferences'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/preferences',
  authenticate,
  userController.getPreferences
);

/**
 * @swagger
 * /api/users/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPreferences'
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/preferences',
  authenticate,
  updatePreferencesValidation,
  validate,
  userController.updatePreferences
);

/**
 * @swagger
 * /api/users/activity:
 *   get:
 *     summary: Get user activity
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Activity retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/activity',
  authenticate,
  activityValidation,
  validate,
  userController.getActivity
);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/stats',
  authenticate,
  userController.getStats
);

/**
 * @swagger
 * /api/users/dashboard:
 *   get:
 *     summary: Get user dashboard data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/dashboard',
  authenticate,
  userController.getDashboard
);

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatarUrl
 *             properties:
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/avatar',
  authenticate,
  uploadAvatarValidation,
  validate,
  userController.uploadAvatar
);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/change-password',
  authenticate,
  changePasswordValidation,
  validate,
  userController.changePassword
);

/**
 * @swagger
 * /api/users/export:
 *   get:
 *     summary: Export user data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data exported successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/export',
  authenticate,
  userController.exportUserData
);

/**
 * @swagger
 * /api/users/deactivate:
 *   post:
 *     summary: Deactivate user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/deactivate',
  authenticate,
  userController.deactivateAccount
);

/**
 * @swagger
 * /api/users/reactivate:
 *   post:
 *     summary: Reactivate user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account reactivated successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/reactivate',
  authenticate,
  userController.reactivateAccount
);

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/delete',
  authenticate,
  userController.deleteAccount
);

/**
 * @swagger
 * /api/users/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/notifications',
  authenticate,
  paginationValidation,
  validate,
  userController.getNotifications
);

/**
 * @swagger
 * /api/users/notifications/{notificationId}/read:
 *   post:
 *     summary: Mark notification as read
 *     tags: [Users]
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
router.post(
  '/notifications/:notificationId/read',
  authenticate,
  notificationIdValidation,
  validate,
  userController.markNotificationRead
);

/**
 * @swagger
 * /api/users/sessions:
 *   get:
 *     summary: Get user sessions
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/sessions',
  authenticate,
  userController.getSessions
);

/**
 * @swagger
 * /api/users/sessions/{sessionId}/revoke:
 *   post:
 *     summary: Revoke user session
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Session revoked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.post(
  '/sessions/:sessionId/revoke',
  authenticate,
  sessionIdValidation,
  validate,
  userController.revokeSession
);

// Admin routes
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  userIdValidation,
  validate,
  userController.getUserById
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID (Admin)
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [USER, AGENT, ADMIN, SUPER_ADMIN]
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED, PENDING]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  userIdValidation,
  updateUserValidation,
  validate,
  userController.updateUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin)
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  userIdValidation,
  validate,
  userController.deleteUser
);

/**
 * @swagger
 * /api/users/{id}/stats:
 *   get:
 *     summary: Get user statistics by ID
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.get(
  '/:id/stats',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  userIdValidation,
  validate,
  userController.getUserStats
);

export default router;