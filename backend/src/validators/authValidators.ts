import { body, param, query } from 'express-validator';
import { customValidators } from '@/middleware/validation';

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .custom((value) => {
      if (!customValidators.isStrongPassword(value)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
      return true;
    }),

  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('phone')
    .optional()
    .custom((value) => {
      if (value && !customValidators.isValidPhoneNumber(value)) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),

  body('role')
    .optional()
    .isIn(['BUYER', 'SELLER', 'AGENT'])
    .withMessage('Role must be one of: BUYER, SELLER, AGENT'),

  body('agencyId')
    .optional()
    .custom((value) => {
      if (value && !customValidators.isUUID(value)) {
        throw new Error('Agency ID must be a valid UUID');
      }
      return true;
    }),

  body('licenseNumber')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('License number must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('License number can only contain letters, numbers, and hyphens'),

  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),

  body('website')
    .optional()
    .custom((value) => {
      if (value && !customValidators.isValidUrl(value)) {
        throw new Error('Please provide a valid website URL');
      }
      return true;
    }),

  body('acceptTerms')
    .isBoolean()
    .withMessage('You must accept the terms and conditions')
    .custom((value) => {
      if (!value) {
        throw new Error('You must accept the terms and conditions');
      }
      return true;
    })
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be a boolean value')
];

/**
 * Validation rules for token refresh
 */
export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid refresh token format')
];

/**
 * Validation rules for forgot password
 */
export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

/**
 * Validation rules for reset password
 */
export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid reset token format'),

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .custom((value) => {
      if (!customValidators.isStrongPassword(value)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
      return true;
    }),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

/**
 * Validation rules for change password
 */
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .custom((value) => {
      if (!customValidators.isStrongPassword(value)) {
        throw new Error('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
      return true;
    })
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

/**
 * Validation rules for email verification
 */
export const verifyEmailValidation = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid verification token format')
];

/**
 * Validation rules for resend email verification
 */
export const resendEmailVerificationValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

/**
 * Validation rules for password strength check
 */
export const checkPasswordStrengthValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password must not exceed 128 characters')
];

/**
 * Validation rules for session management
 */
export const sessionValidation = [
  param('sessionId')
    .custom((value) => {
      if (!customValidators.isUUID(value)) {
        throw new Error('Session ID must be a valid UUID');
      }
      return true;
    })
];

/**
 * Validation rules for two-factor authentication setup
 */
export const twoFactorSetupValidation = [
  body('method')
    .isIn(['SMS', 'EMAIL', 'AUTHENTICATOR'])
    .withMessage('Two-factor method must be one of: SMS, EMAIL, AUTHENTICATOR'),

  body('phoneNumber')
    .if(body('method').equals('SMS'))
    .custom((value) => {
      if (!customValidators.isValidPhoneNumber(value)) {
        throw new Error('Please provide a valid phone number for SMS verification');
      }
      return true;
    }),

  body('email')
    .if(body('method').equals('EMAIL'))
    .isEmail()
    .withMessage('Please provide a valid email address for email verification')
    .normalizeEmail()
];

/**
 * Validation rules for two-factor authentication verification
 */
export const twoFactorVerifyValidation = [
  body('code')
    .isLength({ min: 4, max: 8 })
    .withMessage('Verification code must be between 4 and 8 characters')
    .isNumeric()
    .withMessage('Verification code must contain only numbers'),

  body('method')
    .isIn(['SMS', 'EMAIL', 'AUTHENTICATOR'])
    .withMessage('Two-factor method must be one of: SMS, EMAIL, AUTHENTICATOR')
];

/**
 * Validation rules for profile update
 */
export const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('phone')
    .optional()
    .custom((value) => {
      if (value && !customValidators.isValidPhoneNumber(value)) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),

  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),

  body('website')
    .optional()
    .custom((value) => {
      if (value && !customValidators.isValidUrl(value)) {
        throw new Error('Please provide a valid website URL');
      }
      return true;
    }),

  body('licenseNumber')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('License number must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('License number can only contain letters, numbers, and hyphens'),

  body('specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array')
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error('Maximum 10 specializations allowed');
      }
      return true;
    }),

  body('specializations.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each specialization must be between 1 and 50 characters'),

  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array')
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error('Maximum 10 languages allowed');
      }
      return true;
    }),

  body('languages.*')
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each language must be between 2 and 30 characters'),

  body('socialMedia')
    .optional()
    .isObject()
    .withMessage('Social media must be an object'),

  body('socialMedia.facebook')
    .optional()
    .custom((value) => {
      if (value && !customValidators.isValidUrl(value)) {
        throw new Error('Facebook URL must be a valid URL');
      }
      return true;
    }),

  body('socialMedia.twitter')
    .optional()
    .custom((value) => {
      if (value && !customValidators.isValidUrl(value)) {
        throw new Error('Twitter URL must be a valid URL');
      }
      return true;
    }),

  body('socialMedia.linkedin')
    .optional()
    .custom((value) => {
      if (value && !customValidators.isValidUrl(value)) {
        throw new Error('LinkedIn URL must be a valid URL');
      }
      return true;
    }),

  body('socialMedia.instagram')
    .optional()
    .custom((value) => {
      if (value && !customValidators.isValidUrl(value)) {
        throw new Error('Instagram URL must be a valid URL');
      }
      return true;
    })
];

/**
 * Validation rules for API key generation
 */
export const generateApiKeyValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('API key name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s-_]+$/)
    .withMessage('API key name can only contain letters, numbers, spaces, hyphens, and underscores'),

  body('permissions')
    .isArray({ min: 1 })
    .withMessage('At least one permission must be specified'),

  body('permissions.*')
    .isIn(['READ', 'WRITE', 'DELETE', 'ADMIN'])
    .withMessage('Each permission must be one of: READ, WRITE, DELETE, ADMIN'),

  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date')
    .custom((value) => {
      if (value && !customValidators.isNotPastDate(value)) {
        throw new Error('Expiration date cannot be in the past');
      }
      if (value && !customValidators.isReasonableFutureDate(value, 5)) {
        throw new Error('Expiration date cannot be more than 5 years in the future');
      }
      return true;
    })
];

/**
 * Validation rules for device management
 */
export const deviceValidation = [
  body('deviceName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Device name must be between 1 and 100 characters'),

  body('deviceType')
    .optional()
    .isIn(['DESKTOP', 'MOBILE', 'TABLET', 'OTHER'])
    .withMessage('Device type must be one of: DESKTOP, MOBILE, TABLET, OTHER'),

  body('pushToken')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Push token must be between 10 and 500 characters')
];

/**
 * Query parameter validation for authentication endpoints
 */
export const authQueryValidation = [
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
    .isIn(['createdAt', 'updatedAt', 'lastLoginAt', 'email', 'firstName', 'lastName'])
    .withMessage('Sort by must be one of: createdAt, updatedAt, lastLoginAt, email, firstName, lastName'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),

  query('role')
    .optional()
    .isIn(['BUYER', 'SELLER', 'AGENT', 'ADMIN', 'SUPER_ADMIN'])
    .withMessage('Role must be one of: BUYER, SELLER, AGENT, ADMIN, SUPER_ADMIN'),

  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'])
    .withMessage('Status must be one of: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION'),

  query('verified')
    .optional()
    .isBoolean()
    .withMessage('Verified must be a boolean value'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (value && req.query.dateFrom && new Date(value) < new Date(req.query.dateFrom as string)) {
        throw new Error('Date to must be after date from');
      }
      return true;
    })
];