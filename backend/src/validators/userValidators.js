const { body, param, query } = require('express-validator');

// User ID validation
const userIdValidation = [
  param('userId')
    .isString()
    .withMessage('User ID must be a string')
    .notEmpty()
    .withMessage('User ID is required')
];

// Update profile validation
const updateProfileValidation = [
  body('firstName')
    .optional()
    .isString()
    .withMessage('First name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .isString()
    .withMessage('Last name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
];

// Update user validation (admin)
const updateUserValidation = [
  body('firstName')
    .optional()
    .isString()
    .withMessage('First name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .isString()
    .withMessage('Last name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('role')
    .optional()
    .isIn(['USER', 'AGENT', 'ADMIN', 'SUPER_ADMIN'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Search users validation
const searchUsersValidation = [
  query('query')
    .optional()
    .isString()
    .withMessage('Search query must be a string'),
  query('role')
    .optional()
    .isIn(['USER', 'AGENT', 'ADMIN', 'SUPER_ADMIN'])
    .withMessage('Invalid role'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Update preferences validation
const updatePreferencesValidation = [
  body('notifications')
    .optional()
    .isObject()
    .withMessage('Notifications must be an object'),
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be a boolean'),
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be a boolean'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be a boolean')
];

// Change password validation
const changePasswordValidation = [
  body('currentPassword')
    .isString()
    .withMessage('Current password must be a string')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isString()
    .withMessage('New password must be a string')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Upload avatar validation
const uploadAvatarValidation = [
  body('avatar')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('Avatar file is required');
      }
      return true;
    })
];

// Activity validation
const activityValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date')
];

// Agents validation
const agentsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['name', 'rating', 'properties', 'createdAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Notification ID validation
const notificationIdValidation = [
  param('notificationId')
    .isString()
    .withMessage('Notification ID must be a string')
    .notEmpty()
    .withMessage('Notification ID is required')
];

// Session ID validation
const sessionIdValidation = [
  param('sessionId')
    .isString()
    .withMessage('Session ID must be a string')
    .notEmpty()
    .withMessage('Session ID is required')
];

// Bulk operation validation
const bulkOperationValidation = [
  body('userIds')
    .isArray()
    .withMessage('User IDs must be an array')
    .notEmpty()
    .withMessage('User IDs array cannot be empty'),
  body('userIds.*')
    .isString()
    .withMessage('Each user ID must be a string')
];

// User import validation
const userImportValidation = [
  body('users')
    .isArray()
    .withMessage('Users must be an array')
    .notEmpty()
    .withMessage('Users array cannot be empty'),
  body('users.*.email')
    .isEmail()
    .withMessage('Each user must have a valid email'),
  body('users.*.firstName')
    .isString()
    .withMessage('Each user must have a first name')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('users.*.lastName')
    .isString()
    .withMessage('Each user must have a last name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('users.*.role')
    .optional()
    .isIn(['USER', 'AGENT', 'ADMIN'])
    .withMessage('Invalid role')
];

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Date range validation
const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date')
];

// Analytics period validation
const analyticsPeriodValidation = [
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Period must be day, week, month, or year')
];

module.exports = {
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
};