const { Router } = require('express');
const userController = require('../controllers/userController.js');
const { authenticateToken: authenticate, requireRole: authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Define optionalAuthenticate middleware since it doesn't exist in auth.js
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    // Continue without authentication
    return next();
  }
  // If there is an auth header, use the regular authenticate middleware
  authenticate(req, res, next);
};
const {
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
} = require('../validators/userValidators');

const router = Router();

// Get current user profile
router.get(
  '/profile',
  authenticate,
  userController.getProfile
);

// Update current user profile
router.put(
  '/profile',
  authenticate,
  updateProfileValidation,
  validate,
  userController.updateProfile
);

// Search users
router.get(
  '/search',
  optionalAuthenticate,
  searchUsersValidation,
  validate,
  userController.searchUsers
);

// Get agents list
router.get(
  '/agents',
  optionalAuthenticate,
  agentsValidation,
  validate,
  userController.getAgents
);

// Get user preferences
router.get(
  '/preferences',
  authenticate,
  userController.getPreferences
);

// Update user preferences
router.put(
  '/preferences',
  authenticate,
  updatePreferencesValidation,
  validate,
  userController.updatePreferences
);

// Get user by ID
router.get(
  '/:userId',
  authenticate,
  userIdValidation,
  validate,
  userController.getUserById
);

// Update user (admin only)
router.put(
  '/:userId',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  userIdValidation,
  updateUserValidation,
  validate,
  userController.updateUser
);

// Delete user (admin only)
router.delete(
  '/:userId',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  userIdValidation,
  validate,
  userController.deleteUser
);

// Get user activity
router.get(
  '/activity',
  authenticate,
  activityValidation,
  validate,
  userController.getActivity
);

// Get user stats
router.get(
  '/stats',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  userController.getStats
);

// Get specific user stats
router.get(
  '/:userId/stats',
  authenticate,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  userIdValidation,
  validate,
  userController.getUserStats
);

// Delete own account
router.delete(
  '/account',
  authenticate,
  userController.deleteAccount
);

// Upload avatar
router.post(
  '/avatar',
  authenticate,
  uploadAvatarValidation,
  validate,
  userController.uploadAvatar
);

// Change password
router.post(
  '/change-password',
  authenticate,
  changePasswordValidation,
  validate,
  userController.changePassword
);

// Get dashboard data
router.get(
  '/dashboard',
  authenticate,
  userController.getDashboard
);

// Export user data
router.get(
  '/export',
  authenticate,
  userController.exportUserData
);

// Deactivate account
router.post(
  '/deactivate',
  authenticate,
  userController.deactivateAccount
);

// Reactivate account
router.post(
  '/reactivate',
  authenticate,
  userController.reactivateAccount
);

// Get notifications
router.get(
  '/notifications',
  authenticate,
  userController.getNotifications
);

// Mark notification as read
router.put(
  '/notifications/:notificationId',
  authenticate,
  notificationIdValidation,
  validate,
  userController.markNotificationRead
);

// Get active sessions
router.get(
  '/sessions',
  authenticate,
  userController.getSessions
);

// Revoke session
router.delete(
  '/sessions/:sessionId',
  authenticate,
  sessionIdValidation,
  validate,
  userController.revokeSession
);

module.exports = router;