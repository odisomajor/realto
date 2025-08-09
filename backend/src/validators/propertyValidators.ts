import { body, param, query } from 'express-validator';
import { customValidators } from '@/middleware/validation';

/**
 * Validation rules for property search
 */
export const searchPropertiesValidation = [
  query('propertyType')
    .optional()
    .isIn(['HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL', 'MULTI_FAMILY'])
    .withMessage('Property type must be one of: HOUSE, APARTMENT, CONDO, TOWNHOUSE, LAND, COMMERCIAL, MULTI_FAMILY'),

  query('listingType')
    .optional()
    .isIn(['SALE', 'RENT', 'LEASE'])
    .withMessage('Listing type must be one of: SALE, RENT, LEASE'),

  query('status')
    .optional()
    .isIn(['ACTIVE', 'PENDING', 'SOLD', 'RENTED', 'INACTIVE'])
    .withMessage('Status must be one of: ACTIVE, PENDING, SOLD, RENTED, INACTIVE'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number')
    .custom((value) => {
      if (value && !customValidators.isValidPrice(Number(value))) {
        throw new Error('Minimum price must be a valid price');
      }
      return true;
    }),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number')
    .custom((value, { req }) => {
      if (value && req.query.minPrice && Number(value) < Number(req.query.minPrice)) {
        throw new Error('Maximum price must be greater than minimum price');
      }
      if (value && !customValidators.isValidPrice(Number(value))) {
        throw new Error('Maximum price must be a valid price');
      }
      return true;
    }),

  query('minBedrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Minimum bedrooms must be between 0 and 20'),

  query('maxBedrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Maximum bedrooms must be between 0 and 20')
    .custom((value, { req }) => {
      if (value && req.query.minBedrooms && Number(value) < Number(req.query.minBedrooms)) {
        throw new Error('Maximum bedrooms must be greater than or equal to minimum bedrooms');
      }
      return true;
    }),

  query('minBathrooms')
    .optional()
    .isFloat({ min: 0, max: 20 })
    .withMessage('Minimum bathrooms must be between 0 and 20'),

  query('maxBathrooms')
    .optional()
    .isFloat({ min: 0, max: 20 })
    .withMessage('Maximum bathrooms must be between 0 and 20')
    .custom((value, { req }) => {
      if (value && req.query.minBathrooms && Number(value) < Number(req.query.minBathrooms)) {
        throw new Error('Maximum bathrooms must be greater than or equal to minimum bathrooms');
      }
      return true;
    }),

  query('minSquareFootage')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum square footage must be a positive integer')
    .custom((value) => {
      if (value && !customValidators.isValidSquareFootage(Number(value))) {
        throw new Error('Minimum square footage must be a valid square footage');
      }
      return true;
    }),

  query('maxSquareFootage')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum square footage must be a positive integer')
    .custom((value, { req }) => {
      if (value && req.query.minSquareFootage && Number(value) < Number(req.query.minSquareFootage)) {
        throw new Error('Maximum square footage must be greater than minimum square footage');
      }
      if (value && !customValidators.isValidSquareFootage(Number(value))) {
        throw new Error('Maximum square footage must be a valid square footage');
      }
      return true;
    }),

  query('yearBuiltFrom')
    .optional()
    .isInt()
    .withMessage('Year built from must be an integer')
    .custom((value) => {
      if (value && !customValidators.isValidYear(Number(value))) {
        throw new Error('Year built from must be a valid year');
      }
      return true;
    }),

  query('yearBuiltTo')
    .optional()
    .isInt()
    .withMessage('Year built to must be an integer')
    .custom((value, { req }) => {
      if (value && req.query.yearBuiltFrom && Number(value) < Number(req.query.yearBuiltFrom)) {
        throw new Error('Year built to must be greater than or equal to year built from');
      }
      if (value && !customValidators.isValidYear(Number(value))) {
        throw new Error('Year built to must be a valid year');
      }
      return true;
    }),

  query('city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('City can only contain letters, spaces, hyphens, and apostrophes'),

  query('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('State can only contain letters, spaces, hyphens, and apostrophes'),

  query('zipCode')
    .optional()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('ZIP code must be in format 12345 or 12345-6789'),

  query('neighborhood')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Neighborhood must be between 1 and 100 characters'),

  query('latitude')
    .optional()
    .isFloat()
    .withMessage('Latitude must be a valid number')
    .custom((value) => {
      if (value && !customValidators.isCoordinate(Number(value), 'latitude')) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),

  query('longitude')
    .optional()
    .isFloat()
    .withMessage('Longitude must be a valid number')
    .custom((value) => {
      if (value && !customValidators.isCoordinate(Number(value), 'longitude')) {
        throw new Error('Longitude must be between -180 and 180');
      }
      return true;
    }),

  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 miles'),

  query('features')
    .optional()
    .custom((value) => {
      if (value) {
        const features = value.split(',');
        if (features.length > 20) {
          throw new Error('Maximum 20 features allowed');
        }
        for (const feature of features) {
          if (feature.trim().length === 0 || feature.trim().length > 50) {
            throw new Error('Each feature must be between 1 and 50 characters');
          }
        }
      }
      return true;
    }),

  query('amenities')
    .optional()
    .custom((value) => {
      if (value) {
        const amenities = value.split(',');
        if (amenities.length > 20) {
          throw new Error('Maximum 20 amenities allowed');
        }
        for (const amenity of amenities) {
          if (amenity.trim().length === 0 || amenity.trim().length > 50) {
            throw new Error('Each amenity must be between 1 and 50 characters');
          }
        }
      }
      return true;
    }),

  query('agentId')
    .optional()
    .custom((value) => {
      if (value && !customValidators.isUUID(value)) {
        throw new Error('Agent ID must be a valid UUID');
      }
      return true;
    }),

  query('agencyId')
    .optional()
    .custom((value) => {
      if (value && !customValidators.isUUID(value)) {
        throw new Error('Agency ID must be a valid UUID');
      }
      return true;
    }),

  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),

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
    .isIn(['createdAt', 'updatedAt', 'price', 'bedrooms', 'bathrooms', 'squareFootage', 'yearBuilt', 'views'])
    .withMessage('Sort by must be one of: createdAt, updatedAt, price, bedrooms, bathrooms, squareFootage, yearBuilt, views'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),

  query('includeInactive')
    .optional()
    .isBoolean()
    .withMessage('Include inactive must be a boolean value')
];

/**
 * Validation rules for property ID parameter
 */
export const propertyIdValidation = [
  param('id')
    .custom((value) => {
      if (!customValidators.isUUID(value)) {
        throw new Error('Property ID must be a valid UUID');
      }
      return true;
    })
];

/**
 * Validation rules for property slug parameter
 */
export const propertySlugValidation = [
  param('slug')
    .custom((value) => {
      if (!customValidators.isSlug(value)) {
        throw new Error('Property slug must be a valid slug format');
      }
      return true;
    })
];

/**
 * Validation rules for creating a property
 */
export const createPropertyValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),

  body('propertyType')
    .isIn(['HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL', 'MULTI_FAMILY'])
    .withMessage('Property type must be one of: HOUSE, APARTMENT, CONDO, TOWNHOUSE, LAND, COMMERCIAL, MULTI_FAMILY'),

  body('listingType')
    .isIn(['SALE', 'RENT', 'LEASE'])
    .withMessage('Listing type must be one of: SALE, RENT, LEASE'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .custom((value) => {
      if (!customValidators.isValidPrice(Number(value))) {
        throw new Error('Price must be a valid price');
      }
      return true;
    }),

  body('bedrooms')
    .isInt({ min: 0, max: 20 })
    .withMessage('Bedrooms must be between 0 and 20'),

  body('bathrooms')
    .isFloat({ min: 0, max: 20 })
    .withMessage('Bathrooms must be between 0 and 20')
    .custom((value) => {
      if (!customValidators.isValidBathroomCount(Number(value))) {
        throw new Error('Bathrooms must be a valid bathroom count (allows half bathrooms)');
      }
      return true;
    }),

  body('squareFootage')
    .isInt({ min: 1 })
    .withMessage('Square footage must be a positive integer')
    .custom((value) => {
      if (!customValidators.isValidSquareFootage(Number(value))) {
        throw new Error('Square footage must be a valid square footage');
      }
      return true;
    }),

  body('lotSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lot size must be a positive number')
    .custom((value) => {
      if (value && !customValidators.isValidLotSize(Number(value))) {
        throw new Error('Lot size must be a valid lot size');
      }
      return true;
    }),

  body('yearBuilt')
    .optional()
    .isInt()
    .withMessage('Year built must be an integer')
    .custom((value) => {
      if (value && !customValidators.isValidYear(Number(value))) {
        throw new Error('Year built must be a valid year');
      }
      return true;
    }),

  body('parkingSpaces')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Parking spaces must be between 0 and 20'),

  body('address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),

  body('city')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('City can only contain letters, spaces, hyphens, and apostrophes'),

  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('State can only contain letters, spaces, hyphens, and apostrophes'),

  body('zipCode')
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('ZIP code must be in format 12345 or 12345-6789'),

  body('neighborhood')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Neighborhood must be between 1 and 100 characters'),

  body('schoolDistrict')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('School district must be between 1 and 100 characters'),

  body('latitude')
    .isFloat()
    .withMessage('Latitude must be a valid number')
    .custom((value) => {
      if (!customValidators.isCoordinate(Number(value), 'latitude')) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),

  body('longitude')
    .isFloat()
    .withMessage('Longitude must be a valid number')
    .custom((value) => {
      if (!customValidators.isCoordinate(Number(value), 'longitude')) {
        throw new Error('Longitude must be between -180 and 180');
      }
      return true;
    }),

  body('features')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Features must be an array with maximum 20 items'),

  body('features.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each feature must be between 1 and 50 characters'),

  body('amenities')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Amenities must be an array with maximum 20 items'),

  body('amenities.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each amenity must be between 1 and 50 characters'),

  body('hoaFees')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('HOA fees must be a positive number'),

  body('propertyTaxes')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Property taxes must be a positive number'),

  body('agencyId')
    .optional()
    .custom((value) => {
      if (value && !customValidators.isUUID(value)) {
        throw new Error('Agency ID must be a valid UUID');
      }
      return true;
    })
];

/**
 * Validation rules for updating a property
 */
export const updatePropertyValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),

  body('propertyType')
    .optional()
    .isIn(['HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL', 'MULTI_FAMILY'])
    .withMessage('Property type must be one of: HOUSE, APARTMENT, CONDO, TOWNHOUSE, LAND, COMMERCIAL, MULTI_FAMILY'),

  body('listingType')
    .optional()
    .isIn(['SALE', 'RENT', 'LEASE'])
    .withMessage('Listing type must be one of: SALE, RENT, LEASE'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'PENDING', 'SOLD', 'RENTED', 'INACTIVE'])
    .withMessage('Status must be one of: ACTIVE, PENDING, SOLD, RENTED, INACTIVE'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .custom((value) => {
      if (value && !customValidators.isValidPrice(Number(value))) {
        throw new Error('Price must be a valid price');
      }
      return true;
    }),

  body('bedrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Bedrooms must be between 0 and 20'),

  body('bathrooms')
    .optional()
    .isFloat({ min: 0, max: 20 })
    .withMessage('Bathrooms must be between 0 and 20')
    .custom((value) => {
      if (value && !customValidators.isValidBathroomCount(Number(value))) {
        throw new Error('Bathrooms must be a valid bathroom count (allows half bathrooms)');
      }
      return true;
    }),

  body('squareFootage')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Square footage must be a positive integer')
    .custom((value) => {
      if (value && !customValidators.isValidSquareFootage(Number(value))) {
        throw new Error('Square footage must be a valid square footage');
      }
      return true;
    }),

  body('lotSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lot size must be a positive number')
    .custom((value) => {
      if (value && !customValidators.isValidLotSize(Number(value))) {
        throw new Error('Lot size must be a valid lot size');
      }
      return true;
    }),

  body('yearBuilt')
    .optional()
    .isInt()
    .withMessage('Year built must be an integer')
    .custom((value) => {
      if (value && !customValidators.isValidYear(Number(value))) {
        throw new Error('Year built must be a valid year');
      }
      return true;
    }),

  body('parkingSpaces')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Parking spaces must be between 0 and 20'),

  body('address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('City can only contain letters, spaces, hyphens, and apostrophes'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('State can only contain letters, spaces, hyphens, and apostrophes'),

  body('zipCode')
    .optional()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('ZIP code must be in format 12345 or 12345-6789'),

  body('neighborhood')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Neighborhood must be between 1 and 100 characters'),

  body('schoolDistrict')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('School district must be between 1 and 100 characters'),

  body('latitude')
    .optional()
    .isFloat()
    .withMessage('Latitude must be a valid number')
    .custom((value) => {
      if (value && !customValidators.isCoordinate(Number(value), 'latitude')) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),

  body('longitude')
    .optional()
    .isFloat()
    .withMessage('Longitude must be a valid number')
    .custom((value) => {
      if (value && !customValidators.isCoordinate(Number(value), 'longitude')) {
        throw new Error('Longitude must be between -180 and 180');
      }
      return true;
    }),

  body('features')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Features must be an array with maximum 20 items'),

  body('features.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each feature must be between 1 and 50 characters'),

  body('amenities')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Amenities must be an array with maximum 20 items'),

  body('amenities.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each amenity must be between 1 and 50 characters'),

  body('hoaFees')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('HOA fees must be a positive number'),

  body('propertyTaxes')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Property taxes must be a positive number')
];

/**
 * Validation rules for property inquiry
 */
export const propertyInquiryValidation = [
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),

  body('contactMethod')
    .isIn(['EMAIL', 'PHONE', 'BOTH'])
    .withMessage('Contact method must be one of: EMAIL, PHONE, BOTH'),

  body('preferredTime')
    .optional()
    .isIn(['MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME'])
    .withMessage('Preferred time must be one of: MORNING, AFTERNOON, EVENING, ANYTIME')
];

/**
 * Validation rules for property appointment
 */
export const propertyAppointmentValidation = [
  body('appointmentDate')
    .isISO8601()
    .withMessage('Appointment date must be a valid ISO 8601 date')
    .custom((value) => {
      if (!customValidators.isNotPastDate(value)) {
        throw new Error('Appointment date cannot be in the past');
      }
      if (!customValidators.isReasonableFutureDate(value, 1)) {
        throw new Error('Appointment date cannot be more than 1 year in the future');
      }
      return true;
    }),

  body('appointmentTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Appointment time must be in HH:MM format'),

  body('appointmentType')
    .isIn(['VIEWING', 'INSPECTION', 'CONSULTATION', 'OTHER'])
    .withMessage('Appointment type must be one of: VIEWING, INSPECTION, CONSULTATION, OTHER'),

  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters')
];

/**
 * Validation rules for property review
 */
export const propertyReviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),

  body('reviewType')
    .isIn(['PROPERTY', 'AGENT', 'AGENCY', 'EXPERIENCE'])
    .withMessage('Review type must be one of: PROPERTY, AGENT, AGENCY, EXPERIENCE')
];

/**
 * Validation rules for agent ID parameter
 */
export const agentIdValidation = [
  param('agentId')
    .custom((value) => {
      if (!customValidators.isUUID(value)) {
        throw new Error('Agent ID must be a valid UUID');
      }
      return true;
    })
];

/**
 * Validation rules for pagination and sorting
 */
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

/**
 * Validation rules for property analytics access
 */
export const analyticsValidation = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y', 'all'])
    .withMessage('Period must be one of: 7d, 30d, 90d, 1y, all'),

  query('metrics')
    .optional()
    .custom((value) => {
      if (value) {
        const metrics = value.split(',');
        const validMetrics = ['views', 'favorites', 'inquiries', 'appointments', 'reviews'];
        for (const metric of metrics) {
          if (!validMetrics.includes(metric.trim())) {
            throw new Error(`Invalid metric: ${metric}. Valid metrics are: ${validMetrics.join(', ')}`);
          }
        }
      }
      return true;
    })
];