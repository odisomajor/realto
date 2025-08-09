const { z } = require('zod');

// User validation schemas
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  role: z.enum(['USER', 'AGENT']).default('USER')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Property validation schemas
const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'COMMERCIAL', 'LAND', 'WAREHOUSE', 'CONTAINER']),
  listingType: z.enum(['FOR_SALE', 'FOR_RENT']),
  price: z.number().positive('Price must be positive'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  county: z.string().min(2, 'County must be at least 2 characters'),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  squareFootage: z.number().positive().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  virtualTour: z.string().url().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

const updatePropertySchema = propertySchema.partial();

// Inquiry validation schema
const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  propertyId: z.string().cuid('Invalid property ID')
});

// Query validation schemas
const propertyQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val)).default('1'),
  limit: z.string().transform(val => parseInt(val)).default('10'),
  search: z.string().optional(),
  propertyType: z.string().optional(),
  listingType: z.string().optional(),
  type: z.string().optional(), // Frontend type parameter (sale/rent)
  minPrice: z.string().transform(val => parseFloat(val)).optional(),
  maxPrice: z.string().transform(val => parseFloat(val)).optional(),
  bedrooms: z.string().transform(val => parseInt(val)).optional(),
  bathrooms: z.string().transform(val => parseInt(val)).optional(),
  location: z.string().optional(),
  county: z.string().optional(),
  city: z.string().optional(),
  featured: z.string().transform(val => val === 'true').optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.string().default('desc')
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Query validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  propertySchema,
  updatePropertySchema,
  inquirySchema,
  propertyQuerySchema,
  validate,
  validateQuery
};