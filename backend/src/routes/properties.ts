import { Router } from 'express';
import * as propertyController from '@/controllers/propertyController';
import { authenticate, authorize, optionalAuthenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import {
  searchPropertiesValidation,
  propertyIdValidation,
  propertySlugValidation,
  createPropertyValidation,
  updatePropertyValidation,
  propertyInquiryValidation,
  propertyAppointmentValidation,
  propertyReviewValidation,
  agentIdValidation,
  paginationValidation,
  analyticsValidation
} from '@/validators/propertyValidators';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         propertyType:
 *           type: string
 *           enum: [HOUSE, APARTMENT, CONDO, TOWNHOUSE, LAND, COMMERCIAL, MULTI_FAMILY]
 *         listingType:
 *           type: string
 *           enum: [SALE, RENT, LEASE]
 *         status:
 *           type: string
 *           enum: [ACTIVE, PENDING, SOLD, RENTED, INACTIVE]
 *         price:
 *           type: number
 *         bedrooms:
 *           type: integer
 *         bathrooms:
 *           type: number
 *         squareFootage:
 *           type: integer
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         zipCode:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PropertySearchResult:
 *       type: object
 *       properties:
 *         properties:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Property'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             hasNextPage:
 *               type: boolean
 *             hasPreviousPage:
 *               type: boolean
 */

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Search properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [HOUSE, APARTMENT, CONDO, TOWNHOUSE, LAND, COMMERCIAL, MULTI_FAMILY]
 *       - in: query
 *         name: listingType
 *         schema:
 *           type: string
 *           enum: [SALE, RENT, LEASE]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: minBedrooms
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxBedrooms
 *         schema:
 *           type: integer
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: zipCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
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
 *           enum: [createdAt, updatedAt, price, bedrooms, bathrooms, squareFootage, yearBuilt, views]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Properties found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PropertySearchResult'
 *                 message:
 *                   type: string
 */
router.get(
  '/',
  optionalAuthenticate,
  searchPropertiesValidation,
  validate,
  propertyController.searchProperties
);

/**
 * @swagger
 * /api/properties/featured:
 *   get:
 *     summary: Get featured properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Featured properties retrieved successfully
 */
router.get(
  '/featured',
  optionalAuthenticate,
  paginationValidation,
  validate,
  propertyController.getFeaturedProperties
);

/**
 * @swagger
 * /api/properties/recent:
 *   get:
 *     summary: Get recent properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Recent properties retrieved successfully
 */
router.get(
  '/recent',
  optionalAuthenticate,
  paginationValidation,
  validate,
  propertyController.getRecentProperties
);

/**
 * @swagger
 * /api/properties/my:
 *   get:
 *     summary: Get current user's properties
 *     tags: [Properties]
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
 *         description: User properties retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/my',
  authenticate,
  authorize(['AGENT', 'ADMIN', 'SUPER_ADMIN']),
  paginationValidation,
  validate,
  propertyController.getMyProperties
);

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - propertyType
 *               - listingType
 *               - price
 *               - bedrooms
 *               - bathrooms
 *               - squareFootage
 *               - address
 *               - city
 *               - state
 *               - zipCode
 *               - latitude
 *               - longitude
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               propertyType:
 *                 type: string
 *                 enum: [HOUSE, APARTMENT, CONDO, TOWNHOUSE, LAND, COMMERCIAL, MULTI_FAMILY]
 *               listingType:
 *                 type: string
 *                 enum: [SALE, RENT, LEASE]
 *               price:
 *                 type: number
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: number
 *               squareFootage:
 *                 type: integer
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Property created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/',
  authenticate,
  authorize(['AGENT', 'ADMIN', 'SUPER_ADMIN']),
  createPropertyValidation,
  validate,
  propertyController.createProperty
);

/**
 * @swagger
 * /api/properties/agent/{agentId}:
 *   get:
 *     summary: Get properties by agent
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Agent properties retrieved successfully
 *       404:
 *         description: Agent not found
 */
router.get(
  '/agent/:agentId',
  optionalAuthenticate,
  agentIdValidation,
  paginationValidation,
  validate,
  propertyController.getAgentProperties
);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *       404:
 *         description: Property not found
 */
router.get(
  '/:id',
  optionalAuthenticate,
  propertyIdValidation,
  validate,
  propertyController.getPropertyById
);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update property
 *     tags: [Properties]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, PENDING, SOLD, RENTED, INACTIVE]
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Property not found
 */
router.put(
  '/:id',
  authenticate,
  propertyIdValidation,
  updatePropertyValidation,
  validate,
  propertyController.updateProperty
);

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete property
 *     tags: [Properties]
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
 *         description: Property deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Property not found
 */
router.delete(
  '/:id',
  authenticate,
  propertyIdValidation,
  validate,
  propertyController.deleteProperty
);

/**
 * @swagger
 * /api/properties/slug/{slug}:
 *   get:
 *     summary: Get property by slug
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *       404:
 *         description: Property not found
 */
router.get(
  '/slug/:slug',
  optionalAuthenticate,
  propertySlugValidation,
  validate,
  propertyController.getPropertyBySlug
);

/**
 * @swagger
 * /api/properties/{id}/similar:
 *   get:
 *     summary: Get similar properties
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *     responses:
 *       200:
 *         description: Similar properties retrieved successfully
 *       404:
 *         description: Property not found
 */
router.get(
  '/:id/similar',
  optionalAuthenticate,
  propertyIdValidation,
  validate,
  propertyController.getSimilarProperties
);

/**
 * @swagger
 * /api/properties/{id}/analytics:
 *   get:
 *     summary: Get property analytics
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y, all]
 *           default: 30d
 *     responses:
 *       200:
 *         description: Property analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Property not found
 */
router.get(
  '/:id/analytics',
  authenticate,
  propertyIdValidation,
  analyticsValidation,
  validate,
  propertyController.getPropertyAnalytics
);

/**
 * @swagger
 * /api/properties/{id}/favorite:
 *   post:
 *     summary: Toggle property favorite
 *     tags: [Properties]
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
 *         description: Favorite status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 */
router.post(
  '/:id/favorite',
  authenticate,
  propertyIdValidation,
  validate,
  propertyController.toggleFavorite
);

/**
 * @swagger
 * /api/properties/{id}/inquiry:
 *   post:
 *     summary: Submit property inquiry
 *     tags: [Properties]
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
 *             required:
 *               - message
 *               - contactMethod
 *             properties:
 *               message:
 *                 type: string
 *               contactMethod:
 *                 type: string
 *                 enum: [EMAIL, PHONE, BOTH]
 *               preferredTime:
 *                 type: string
 *                 enum: [MORNING, AFTERNOON, EVENING, ANYTIME]
 *     responses:
 *       201:
 *         description: Inquiry submitted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 */
router.post(
  '/:id/inquiry',
  authenticate,
  propertyIdValidation,
  propertyInquiryValidation,
  validate,
  propertyController.submitInquiry
);

/**
 * @swagger
 * /api/properties/{id}/appointment:
 *   post:
 *     summary: Schedule property appointment
 *     tags: [Properties]
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
 *             required:
 *               - appointmentDate
 *               - appointmentTime
 *               - appointmentType
 *             properties:
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *               appointmentTime:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               appointmentType:
 *                 type: string
 *                 enum: [VIEWING, INSPECTION, CONSULTATION, OTHER]
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment scheduled successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 */
router.post(
  '/:id/appointment',
  authenticate,
  propertyIdValidation,
  propertyAppointmentValidation,
  validate,
  propertyController.scheduleAppointment
);

/**
 * @swagger
 * /api/properties/{id}/reviews:
 *   get:
 *     summary: Get property reviews
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       404:
 *         description: Property not found
 */
router.get(
  '/:id/reviews',
  optionalAuthenticate,
  propertyIdValidation,
  paginationValidation,
  validate,
  propertyController.getPropertyReviews
);

/**
 * @swagger
 * /api/properties/{id}/reviews:
 *   post:
 *     summary: Submit property review
 *     tags: [Properties]
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
 *             required:
 *               - rating
 *               - comment
 *               - reviewType
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               reviewType:
 *                 type: string
 *                 enum: [PROPERTY, AGENT, AGENCY, EXPERIENCE]
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 */
router.post(
  '/:id/reviews',
  authenticate,
  propertyIdValidation,
  propertyReviewValidation,
  validate,
  propertyController.submitReview
);

/**
 * @swagger
 * /api/properties/{id}/price-history:
 *   get:
 *     summary: Get property price history
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Price history retrieved successfully
 *       404:
 *         description: Property not found
 */
router.get(
  '/:id/price-history',
  optionalAuthenticate,
  propertyIdValidation,
  validate,
  propertyController.getPriceHistory
);

export default router;