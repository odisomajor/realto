import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

/**
 * Validation middleware that checks for validation errors
 * and returns a formatted error response
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: ValidationError) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    logger.warn('Validation failed', {
      path: req.path,
      method: req.method,
      errors: formattedErrors,
      body: req.body,
      query: req.query,
      params: req.params
    });

    const error = new AppError('Validation failed', 400, formattedErrors);
    return next(error);
  }

  next();
};

/**
 * Custom validation helper functions
 */
export const customValidators = {
  /**
   * Check if value is a valid UUID
   */
  isUUID: (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },

  /**
   * Check if value is a valid slug
   */
  isSlug: (value: string): boolean => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(value);
  },

  /**
   * Check if value is a valid coordinate
   */
  isCoordinate: (value: number, type: 'latitude' | 'longitude'): boolean => {
    if (type === 'latitude') {
      return value >= -90 && value <= 90;
    } else {
      return value >= -180 && value <= 180;
    }
  },

  /**
   * Check if value is a valid price
   */
  isValidPrice: (value: number): boolean => {
    return value > 0 && value <= 999999999; // Max 999 million
  },

  /**
   * Check if value is a valid year
   */
  isValidYear: (value: number): boolean => {
    const currentYear = new Date().getFullYear();
    return value >= 1800 && value <= currentYear + 5; // Allow up to 5 years in future
  },

  /**
   * Check if value is a valid square footage
   */
  isValidSquareFootage: (value: number): boolean => {
    return value > 0 && value <= 100000; // Max 100,000 sq ft
  },

  /**
   * Check if value is a valid lot size
   */
  isValidLotSize: (value: number): boolean => {
    return value > 0 && value <= 10000; // Max 10,000 acres
  },

  /**
   * Check if value is a valid bedroom count
   */
  isValidBedroomCount: (value: number): boolean => {
    return Number.isInteger(value) && value >= 0 && value <= 20;
  },

  /**
   * Check if value is a valid bathroom count
   */
  isValidBathroomCount: (value: number): boolean => {
    return value >= 0 && value <= 20 && (value % 0.5 === 0); // Allow half bathrooms
  },

  /**
   * Check if value is a valid phone number format
   */
  isValidPhoneNumber: (value: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(value);
  },

  /**
   * Check if value is a valid URL
   */
  isValidUrl: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if array contains only unique values
   */
  isUniqueArray: (arr: any[]): boolean => {
    return arr.length === new Set(arr).size;
  },

  /**
   * Check if value is within allowed enum values
   */
  isInEnum: (value: string, enumObject: Record<string, string>): boolean => {
    return Object.values(enumObject).includes(value);
  },

  /**
   * Check if date is not in the past
   */
  isNotPastDate: (value: string | Date): boolean => {
    const date = new Date(value);
    const now = new Date();
    return date >= now;
  },

  /**
   * Check if date is within reasonable future range
   */
  isReasonableFutureDate: (value: string | Date, maxYearsInFuture: number = 2): boolean => {
    const date = new Date(value);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + maxYearsInFuture);
    return date <= maxDate;
  },

  /**
   * Check if string contains only allowed characters
   */
  containsOnlyAllowedChars: (value: string, allowedCharsRegex: RegExp): boolean => {
    return allowedCharsRegex.test(value);
  },

  /**
   * Check if password meets complexity requirements
   */
  isStrongPassword: (value: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    return value.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  },

  /**
   * Check if file extension is allowed
   */
  isAllowedFileExtension: (filename: string, allowedExtensions: string[]): boolean => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  },

  /**
   * Check if file size is within limit
   */
  isValidFileSize: (size: number, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return size <= maxSizeInBytes;
  }
};

/**
 * Sanitization helper functions
 */
export const sanitizers = {
  /**
   * Sanitize HTML content
   */
  sanitizeHtml: (value: string): string => {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  },

  /**
   * Sanitize SQL content
   */
  sanitizeSql: (value: string): string => {
    return value
      .replace(/['";\\]/g, '')
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '')
      .trim();
  },

  /**
   * Normalize phone number
   */
  normalizePhoneNumber: (value: string): string => {
    return value.replace(/\D/g, '');
  },

  /**
   * Normalize URL
   */
  normalizeUrl: (value: string): string => {
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return `https://${value}`;
    }
    return value;
  },

  /**
   * Capitalize first letter of each word
   */
  capitalizeWords: (value: string): string => {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Generate slug from string
   */
  generateSlug: (value: string): string => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Remove extra whitespace
   */
  trimWhitespace: (value: string): string => {
    return value.replace(/\s+/g, ' ').trim();
  },

  /**
   * Format currency
   */
  formatCurrency: (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  }
};

/**
 * Common validation chains for reuse
 */
export const commonValidations = {
  id: () => [
    // Add validation for ID parameter
  ],
  
  email: () => [
    // Add validation for email field
  ],
  
  password: () => [
    // Add validation for password field
  ],
  
  name: (fieldName: string) => [
    // Add validation for name fields
  ],
  
  phone: () => [
    // Add validation for phone field
  ],
  
  url: () => [
    // Add validation for URL field
  ],
  
  coordinates: () => [
    // Add validation for latitude/longitude
  ],
  
  price: () => [
    // Add validation for price field
  ],
  
  date: () => [
    // Add validation for date field
  ]
};

/**
 * Validation error formatter
 */
export const formatValidationErrors = (errors: ValidationError[]) => {
  const formatted: Record<string, string[]> = {};
  
  errors.forEach((error) => {
    const field = error.type === 'field' ? error.path : 'general';
    
    if (!formatted[field]) {
      formatted[field] = [];
    }
    
    formatted[field].push(error.msg);
  });
  
  return formatted;
};

/**
 * Async validation helper
 */
export const asyncValidate = async (
  validationPromises: Promise<any>[],
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await Promise.all(validationPromises);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = formatValidationErrors(errors.array());
      const error = new AppError('Validation failed', 400, formattedErrors);
      return next(error);
    }
    
    next();
  } catch (error) {
    logger.error('Async validation error', { error });
    next(new AppError('Validation error', 500));
  }
};

// Individual exports for backward compatibility
export const isValidUUID = customValidators.isUUID;
export const isValidSlug = customValidators.isSlug;