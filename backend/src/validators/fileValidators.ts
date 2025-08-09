import { body, param, query } from 'express-validator';
import { isValidUUID, isValidSlug } from '@/middleware/validation';

// File ID validation
export const fileIdValidation = [
  param('fileId')
    .notEmpty()
    .withMessage('File ID is required')
    .custom(isValidUUID)
    .withMessage('File ID must be a valid UUID')
];

// Property ID validation for file uploads
export const propertyIdValidation = [
  body('propertyId')
    .optional()
    .custom(isValidUUID)
    .withMessage('Property ID must be a valid UUID')
];

// File category validation
export const categoryValidation = [
  param('category')
    .isIn(['images', 'documents', 'thumbnails'])
    .withMessage('Category must be one of: images, documents, thumbnails')
];

// Filename validation
export const filenameValidation = [
  param('filename')
    .notEmpty()
    .withMessage('Filename is required')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Filename contains invalid characters')
    .isLength({ max: 255 })
    .withMessage('Filename must not exceed 255 characters')
];

// Image processing options validation
export const imageOptionsValidation = [
  body('options')
    .optional()
    .isJSON()
    .withMessage('Options must be valid JSON')
    .custom((value) => {
      if (value) {
        try {
          const options = JSON.parse(value);
          
          // Validate width
          if (options.width !== undefined) {
            if (!Number.isInteger(options.width) || options.width < 1 || options.width > 4000) {
              throw new Error('Width must be an integer between 1 and 4000');
            }
          }
          
          // Validate height
          if (options.height !== undefined) {
            if (!Number.isInteger(options.height) || options.height < 1 || options.height > 4000) {
              throw new Error('Height must be an integer between 1 and 4000');
            }
          }
          
          // Validate quality
          if (options.quality !== undefined) {
            if (!Number.isInteger(options.quality) || options.quality < 1 || options.quality > 100) {
              throw new Error('Quality must be an integer between 1 and 100');
            }
          }
          
          // Validate format
          if (options.format !== undefined) {
            if (!['jpeg', 'png', 'webp'].includes(options.format)) {
              throw new Error('Format must be one of: jpeg, png, webp');
            }
          }
          
          // Validate thumbnail
          if (options.thumbnail !== undefined) {
            if (typeof options.thumbnail !== 'boolean') {
              throw new Error('Thumbnail must be a boolean');
            }
          }
          
          return true;
        } catch (error) {
          throw new Error(`Invalid options: ${error.message}`);
        }
      }
      return true;
    })
];

// File list query validation
export const fileListValidation = [
  query('category')
    .optional()
    .isIn(['image', 'document', 'all'])
    .withMessage('Category must be one of: image, document, all'),
    
  query('propertyId')
    .optional()
    .custom(isValidUUID)
    .withMessage('Property ID must be a valid UUID'),
    
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
    
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (value && req.query.startDate) {
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
    
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
];

// Thumbnail generation validation
export const thumbnailValidation = [
  ...fileIdValidation,
  
  query('width')
    .optional()
    .isInt({ min: 50, max: 1000 })
    .withMessage('Width must be an integer between 50 and 1000'),
    
  query('height')
    .optional()
    .isInt({ min: 50, max: 1000 })
    .withMessage('Height must be an integer between 50 and 1000')
];

// Bulk file deletion validation
export const bulkDeleteValidation = [
  body('fileIds')
    .isArray({ min: 1, max: 50 })
    .withMessage('File IDs must be an array with 1-50 items')
    .custom((fileIds) => {
      for (const fileId of fileIds) {
        if (!isValidUUID(fileId)) {
          throw new Error('All file IDs must be valid UUIDs');
        }
      }
      return true;
    })
];

// Avatar upload validation
export const avatarUploadValidation = [
  // File validation is handled by multer middleware
  // Additional validation can be added here if needed
];

// Property images upload validation
export const propertyImagesValidation = [
  param('propertyId')
    .notEmpty()
    .withMessage('Property ID is required')
    .custom(isValidUUID)
    .withMessage('Property ID must be a valid UUID')
];

// File upload validation (general)
export const fileUploadValidation = [
  ...propertyIdValidation,
  ...imageOptionsValidation
];

// Multiple file upload validation
export const multipleFileUploadValidation = [
  ...propertyIdValidation,
  ...imageOptionsValidation
];

// File serve validation
export const fileServeValidation = [
  ...categoryValidation,
  ...filenameValidation
];

// File metadata validation
export const fileMetadataValidation = [
  ...fileIdValidation
];

// File statistics validation
export const fileStatsValidation = [
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Period must be one of: day, week, month, year'),
    
  query('category')
    .optional()
    .isIn(['image', 'document', 'all'])
    .withMessage('Category must be one of: image, document, all')
];

// File search validation
export const fileSearchValidation = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .trim(),
    
  query('mimetype')
    .optional()
    .matches(/^[a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+$/)
    .withMessage('Invalid MIME type format'),
    
  query('minSize')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum size must be a non-negative integer'),
    
  query('maxSize')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum size must be a non-negative integer')
    .custom((value, { req }) => {
      if (value && req.query.minSize) {
        const minSize = parseInt(req.query.minSize as string);
        const maxSize = parseInt(value);
        if (maxSize <= minSize) {
          throw new Error('Maximum size must be greater than minimum size');
        }
      }
      return true;
    }),
    
  ...fileListValidation
];

// File rename validation
export const fileRenameValidation = [
  ...fileIdValidation,
  
  body('newName')
    .notEmpty()
    .withMessage('New name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('New name must be between 1 and 255 characters')
    .matches(/^[a-zA-Z0-9._\-\s]+$/)
    .withMessage('New name contains invalid characters')
    .trim()
];

// File move validation
export const fileMoveValidation = [
  ...fileIdValidation,
  
  body('newPropertyId')
    .optional()
    .custom(isValidUUID)
    .withMessage('New property ID must be a valid UUID'),
    
  body('newCategory')
    .optional()
    .isIn(['image', 'document'])
    .withMessage('New category must be one of: image, document')
];

// File copy validation
export const fileCopyValidation = [
  ...fileIdValidation,
  
  body('targetPropertyId')
    .optional()
    .custom(isValidUUID)
    .withMessage('Target property ID must be a valid UUID'),
    
  body('newName')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('New name must be between 1 and 255 characters')
    .matches(/^[a-zA-Z0-9._\-\s]+$/)
    .withMessage('New name contains invalid characters')
    .trim()
];

// File share validation
export const fileShareValidation = [
  ...fileIdValidation,
  
  body('shareType')
    .isIn(['public', 'private', 'restricted'])
    .withMessage('Share type must be one of: public, private, restricted'),
    
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date')
    .custom((value) => {
      if (value) {
        const expirationDate = new Date(value);
        const now = new Date();
        if (expirationDate <= now) {
          throw new Error('Expiration date must be in the future');
        }
      }
      return true;
    }),
    
  body('allowedUsers')
    .optional()
    .isArray()
    .withMessage('Allowed users must be an array')
    .custom((users) => {
      if (users && users.length > 0) {
        for (const userId of users) {
          if (!isValidUUID(userId)) {
            throw new Error('All user IDs must be valid UUIDs');
          }
        }
      }
      return true;
    })
];

// File version validation
export const fileVersionValidation = [
  ...fileIdValidation,
  
  query('version')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Version must be a positive integer')
];

// File backup validation
export const fileBackupValidation = [
  body('fileIds')
    .optional()
    .isArray()
    .withMessage('File IDs must be an array')
    .custom((fileIds) => {
      if (fileIds && fileIds.length > 0) {
        for (const fileId of fileIds) {
          if (!isValidUUID(fileId)) {
            throw new Error('All file IDs must be valid UUIDs');
          }
        }
      }
      return true;
    }),
    
  body('backupType')
    .isIn(['full', 'incremental'])
    .withMessage('Backup type must be one of: full, incremental'),
    
  body('compression')
    .optional()
    .isBoolean()
    .withMessage('Compression must be a boolean')
];