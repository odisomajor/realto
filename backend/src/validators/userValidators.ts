import { body, param, query } from 'express-validator';
import { UserRole, UserStatus } from '@/types/user';

// User ID validation
export const userIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format')
];

// User profile update validation
export const updateProfileValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),

  body('specialties')
    .optional()
    .isArray()
    .withMessage('Specialties must be an array'),

  body('specialties.*')
    .optional()
    .isString()
    .withMessage('Each specialty must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Each specialty must be between 2 and 50 characters'),

  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array'),

  body('languages.*')
    .optional()
    .isString()
    .withMessage('Each language must be a string')
    .isLength({ min: 2, max: 30 })
    .withMessage('Each language must be between 2 and 30 characters'),

  body('licenseNumber')
    .optional()
    .isLength({ min: 5, max: 50 })
    .withMessage('License number must be between 5 and 50 characters'),

  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),

  body('city')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  body('state')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),

  body('zipCode')
    .optional()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please provide a valid ZIP code'),

  body('address')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),

  body('agencyId')
    .optional()
    .isUUID()
    .withMessage('Invalid agency ID format'),

  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),

  body('socialMedia.facebook')
    .optional()
    .isURL()
    .withMessage('Facebook URL must be valid'),

  body('socialMedia.twitter')
    .optional()
    .isURL()
    .withMessage('Twitter URL must be valid'),

  body('socialMedia.linkedin')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be valid'),

  body('socialMedia.instagram')
    .optional()
    .isURL()
    .withMessage('Instagram URL must be valid'),

  body('socialMedia.website')
    .optional()
    .isURL()
    .withMessage('Website URL must be valid')
];

// Admin user update validation
export const updateUserValidation = [
  ...updateProfileValidation,
  
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid user role'),

  body('status')
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage('Invalid user status')
];

// User search validation
export const searchUsersValidation = [
  query('q')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),

  query('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid user role'),

  query('status')
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage('Invalid user status'),

  query('agencyId')
    .optional()
    .isUUID()
    .withMessage('Invalid agency ID format'),

  query('city')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  query('state')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),

  query('specialties')
    .optional()
    .isString()
    .withMessage('Specialties must be a comma-separated string'),

  query('languages')
    .optional()
    .isString()
    .withMessage('Languages must be a comma-separated string'),

  query('minExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Minimum experience must be between 0 and 50'),

  query('maxExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Maximum experience must be between 0 and 50'),

  query('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),

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
    .isIn(['createdAt', 'updatedAt', 'firstName', 'lastName', 'yearsOfExperience', 'lastLoginAt'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// User preferences validation
export const updatePreferencesValidation = [
  body('searchPreferences.defaultPropertyType')
    .optional()
    .isString()
    .withMessage('Default property type must be a string'),

  body('searchPreferences.defaultListingType')
    .optional()
    .isString()
    .withMessage('Default listing type must be a string'),

  body('searchPreferences.priceRange.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum price must be a number'),

  body('searchPreferences.priceRange.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum price must be a number'),

  body('searchPreferences.locationPreferences.cities')
    .optional()
    .isArray()
    .withMessage('Cities must be an array'),

  body('searchPreferences.locationPreferences.cities.*')
    .optional()
    .isString()
    .withMessage('Each city must be a string'),

  body('searchPreferences.locationPreferences.states')
    .optional()
    .isArray()
    .withMessage('States must be an array'),

  body('searchPreferences.locationPreferences.states.*')
    .optional()
    .isString()
    .withMessage('Each state must be a string'),

  body('searchPreferences.locationPreferences.radius')
    .optional()
    .isNumeric()
    .withMessage('Radius must be a number'),

  body('searchPreferences.propertyFeatures')
    .optional()
    .isArray()
    .withMessage('Property features must be an array'),

  body('searchPreferences.propertyFeatures.*')
    .optional()
    .isString()
    .withMessage('Each property feature must be a string'),

  body('notificationSettings.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification setting must be a boolean'),

  body('notificationSettings.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification setting must be a boolean'),

  body('notificationSettings.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification setting must be a boolean'),

  body('notificationSettings.marketing')
    .optional()
    .isBoolean()
    .withMessage('Marketing notification setting must be a boolean'),

  body('notificationSettings.newInquiries')
    .optional()
    .isBoolean()
    .withMessage('New inquiries notification setting must be a boolean'),

  body('notificationSettings.appointmentReminders')
    .optional()
    .isBoolean()
    .withMessage('Appointment reminders notification setting must be a boolean'),

  body('notificationSettings.propertyUpdates')
    .optional()
    .isBoolean()
    .withMessage('Property updates notification setting must be a boolean'),

  body('notificationSettings.priceChanges')
    .optional()
    .isBoolean()
    .withMessage('Price changes notification setting must be a boolean'),

  body('notificationSettings.newReviews')
    .optional()
    .isBoolean()
    .withMessage('New reviews notification setting must be a boolean'),

  body('notificationSettings.systemUpdates')
    .optional()
    .isBoolean()
    .withMessage('System updates notification setting must be a boolean'),

  body('displaySettings.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),

  body('displaySettings.language')
    .optional()
    .isString()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language must be a valid language code'),

  body('displaySettings.currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a valid 3-letter currency code'),

  body('displaySettings.measurementUnit')
    .optional()
    .isIn(['metric', 'imperial'])
    .withMessage('Measurement unit must be metric or imperial'),

  body('displaySettings.dateFormat')
    .optional()
    .isString()
    .withMessage('Date format must be a string'),

  body('displaySettings.timeFormat')
    .optional()
    .isIn(['12h', '24h'])
    .withMessage('Time format must be 12h or 24h'),

  body('privacySettings.showEmail')
    .optional()
    .isBoolean()
    .withMessage('Show email setting must be a boolean'),

  body('privacySettings.showPhone')
    .optional()
    .isBoolean()
    .withMessage('Show phone setting must be a boolean'),

  body('privacySettings.showLastSeen')
    .optional()
    .isBoolean()
    .withMessage('Show last seen setting must be a boolean'),

  body('privacySettings.allowDirectMessages')
    .optional()
    .isBoolean()
    .withMessage('Allow direct messages setting must be a boolean'),

  body('privacySettings.profileVisibility')
    .optional()
    .isIn(['public', 'agents_only', 'private'])
    .withMessage('Profile visibility must be public, agents_only, or private')
];

// Password change validation
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// Avatar upload validation
export const uploadAvatarValidation = [
  body('avatarUrl')
    .notEmpty()
    .withMessage('Avatar URL is required')
    .isURL()
    .withMessage('Avatar URL must be valid')
    .matches(/\.(jpg|jpeg|png|gif|webp)$/i)
    .withMessage('Avatar must be a valid image file (jpg, jpeg, png, gif, webp)')
];

// Activity query validation
export const activityValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Agents query validation
export const agentsValidation = [
  query('agencyId')
    .optional()
    .isUUID()
    .withMessage('Invalid agency ID format'),

  query('city')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  query('state')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Notification ID validation
export const notificationIdValidation = [
  param('notificationId')
    .isUUID()
    .withMessage('Invalid notification ID format')
];

// Session ID validation
export const sessionIdValidation = [
  param('sessionId')
    .isUUID()
    .withMessage('Invalid session ID format')
];

// Bulk operation validation
export const bulkOperationValidation = [
  body('operation')
    .notEmpty()
    .withMessage('Operation is required')
    .isIn(['activate', 'deactivate', 'delete', 'update_role', 'send_notification'])
    .withMessage('Invalid operation type'),

  body('userIds')
    .isArray({ min: 1 })
    .withMessage('User IDs array is required and must not be empty'),

  body('userIds.*')
    .isUUID()
    .withMessage('Each user ID must be a valid UUID'),

  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object'),

  body('reason')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters')
];

// User import validation
export const userImportValidation = [
  body('users')
    .isArray({ min: 1 })
    .withMessage('Users array is required and must not be empty'),

  body('users.*.firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('users.*.lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('users.*.email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('users.*.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  body('users.*.role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(UserRole))
    .withMessage('Invalid user role'),

  body('users.*.agencyId')
    .optional()
    .isUUID()
    .withMessage('Invalid agency ID format'),

  body('users.*.licenseNumber')
    .optional()
    .isLength({ min: 5, max: 50 })
    .withMessage('License number must be between 5 and 50 characters'),

  body('users.*.specialties')
    .optional()
    .isArray()
    .withMessage('Specialties must be an array'),

  body('users.*.languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array'),

  body('users.*.bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters')
];

// Common pagination validation
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

// Date range validation
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
      if (req.query.startDate && value && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// Analytics period validation
export const analyticsPeriodValidation = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y', 'all'])
    .withMessage('Period must be one of: 7d, 30d, 90d, 1y, all')
];