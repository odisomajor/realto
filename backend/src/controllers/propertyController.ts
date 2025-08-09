import { Request, Response, NextFunction } from 'express';
import { propertyService } from '@/services/propertyService';
import { AppError, catchAsync } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { 
  PropertySearchFilters, 
  PropertySearchOptions,
  PropertyCreateRequest,
  PropertyUpdateRequest
} from '@/types/property';

/**
 * Search properties with filters and pagination
 */
export const searchProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const filters: PropertySearchFilters = {
      propertyType: req.query.propertyType as any,
      listingType: req.query.listingType as any,
      status: req.query.status as any,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      minBedrooms: req.query.minBedrooms ? Number(req.query.minBedrooms) : undefined,
      maxBedrooms: req.query.maxBedrooms ? Number(req.query.maxBedrooms) : undefined,
      minBathrooms: req.query.minBathrooms ? Number(req.query.minBathrooms) : undefined,
      maxBathrooms: req.query.maxBathrooms ? Number(req.query.maxBathrooms) : undefined,
      minSquareFootage: req.query.minSquareFootage ? Number(req.query.minSquareFootage) : undefined,
      maxSquareFootage: req.query.maxSquareFootage ? Number(req.query.maxSquareFootage) : undefined,
      yearBuiltFrom: req.query.yearBuiltFrom ? Number(req.query.yearBuiltFrom) : undefined,
      yearBuiltTo: req.query.yearBuiltTo ? Number(req.query.yearBuiltTo) : undefined,
      city: req.query.city as string,
      state: req.query.state as string,
      zipCode: req.query.zipCode as string,
      neighborhood: req.query.neighborhood as string,
      latitude: req.query.latitude ? Number(req.query.latitude) : undefined,
      longitude: req.query.longitude ? Number(req.query.longitude) : undefined,
      radius: req.query.radius ? Number(req.query.radius) : undefined,
      features: req.query.features ? (req.query.features as string).split(',') : undefined,
      amenities: req.query.amenities ? (req.query.amenities as string).split(',') : undefined,
      agentId: req.query.agentId as string,
      agencyId: req.query.agencyId as string,
      searchQuery: req.query.q as string
    };

    const options: PropertySearchOptions = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      sortBy: req.query.sortBy as any || 'createdAt',
      sortOrder: req.query.sortOrder as any || 'desc',
      includeInactive: req.query.includeInactive === 'true'
    };

    const result = await propertyService.searchProperties(filters, options);

    logger.info('Properties searched', {
      userId: req.user?.id,
      filters,
      options,
      resultCount: result.properties.length,
      total: result.pagination.total
    });

    res.status(200).json({
      success: true,
      data: result,
      message: `Found ${result.pagination.total} properties`
    });
  }
);

/**
 * Get property by ID
 */
export const getPropertyById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const property = await propertyService.getPropertyById(id, userId);

    logger.info('Property retrieved', {
      propertyId: id,
      userId,
      title: property.title
    });

    res.status(200).json({
      success: true,
      data: property,
      message: 'Property retrieved successfully'
    });
  }
);

/**
 * Get property by slug
 */
export const getPropertyBySlug = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;
    const userId = req.user?.id;

    // First find property by slug to get ID
    const property = await propertyService.searchProperties(
      { searchQuery: slug },
      { limit: 1 }
    );

    if (property.properties.length === 0) {
      throw new AppError('Property not found', 404);
    }

    const propertyDetails = await propertyService.getPropertyById(
      property.properties[0].id,
      userId
    );

    logger.info('Property retrieved by slug', {
      slug,
      propertyId: propertyDetails.id,
      userId,
      title: propertyDetails.title
    });

    res.status(200).json({
      success: true,
      data: propertyDetails,
      message: 'Property retrieved successfully'
    });
  }
);

/**
 * Create new property
 */
export const createProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.user!.id;
    const propertyData: PropertyCreateRequest = req.body;

    // Validate agent permissions
    if (req.user!.role !== 'AGENT' && req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
      throw new AppError('Only agents and admins can create properties', 403);
    }

    const property = await propertyService.createProperty(propertyData, agentId);

    logger.info('Property created', {
      propertyId: property.id,
      agentId,
      title: property.title
    });

    res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully'
    });
  }
);

/**
 * Update property
 */
export const updateProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData: PropertyUpdateRequest = req.body;

    const property = await propertyService.updateProperty(id, updateData, userId);

    logger.info('Property updated', {
      propertyId: id,
      userId,
      title: property.title
    });

    res.status(200).json({
      success: true,
      data: property,
      message: 'Property updated successfully'
    });
  }
);

/**
 * Delete property
 */
export const deleteProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;

    await propertyService.deleteProperty(id, userId);

    logger.info('Property deleted', {
      propertyId: id,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  }
);

/**
 * Get properties by agent
 */
export const getAgentProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { agentId } = req.params;
    
    const options: PropertySearchOptions = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      sortBy: req.query.sortBy as any || 'createdAt',
      sortOrder: req.query.sortOrder as any || 'desc',
      includeInactive: req.query.includeInactive === 'true'
    };

    const result = await propertyService.getPropertiesByAgent(agentId, options);

    logger.info('Agent properties retrieved', {
      agentId,
      requesterId: req.user?.id,
      resultCount: result.properties.length,
      total: result.pagination.total
    });

    res.status(200).json({
      success: true,
      data: result,
      message: `Found ${result.pagination.total} properties for agent`
    });
  }
);

/**
 * Get current user's properties
 */
export const getMyProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.user!.id;
    
    const options: PropertySearchOptions = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      sortBy: req.query.sortBy as any || 'createdAt',
      sortOrder: req.query.sortOrder as any || 'desc',
      includeInactive: true // Allow agents to see their inactive properties
    };

    const result = await propertyService.getPropertiesByAgent(agentId, options);

    logger.info('User properties retrieved', {
      agentId,
      resultCount: result.properties.length,
      total: result.pagination.total
    });

    res.status(200).json({
      success: true,
      data: result,
      message: `Found ${result.pagination.total} of your properties`
    });
  }
);

/**
 * Get similar properties
 */
export const getSimilarProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 6;

    const properties = await propertyService.getSimilarProperties(id, limit);

    logger.info('Similar properties retrieved', {
      propertyId: id,
      userId: req.user?.id,
      resultCount: properties.length
    });

    res.status(200).json({
      success: true,
      data: properties,
      message: `Found ${properties.length} similar properties`
    });
  }
);

/**
 * Get property analytics
 */
export const getPropertyAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if user has permission to view analytics
    const property = await propertyService.getPropertyById(id);
    
    const canViewAnalytics = 
      property.agent.id === userId ||
      req.user!.role === 'ADMIN' ||
      req.user!.role === 'SUPER_ADMIN';

    if (!canViewAnalytics) {
      throw new AppError('Insufficient permissions to view property analytics', 403);
    }

    const analytics = await propertyService.getPropertyAnalytics(id);

    logger.info('Property analytics retrieved', {
      propertyId: id,
      userId,
      views: analytics.views,
      inquiries: analytics.inquiries
    });

    res.status(200).json({
      success: true,
      data: analytics,
      message: 'Property analytics retrieved successfully'
    });
  }
);

/**
 * Toggle property favorite
 */
export const toggleFavorite = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Implementation would go here
    // This would involve creating/deleting a favorite record

    logger.info('Property favorite toggled', {
      propertyId: id,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'Favorite status updated successfully'
    });
  }
);

/**
 * Submit property inquiry
 */
export const submitInquiry = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { message, contactMethod, preferredTime } = req.body;

    // Implementation would go here
    // This would involve creating an inquiry record and notifying the agent

    logger.info('Property inquiry submitted', {
      propertyId: id,
      userId,
      contactMethod
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully'
    });
  }
);

/**
 * Schedule property appointment
 */
export const scheduleAppointment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { appointmentDate, appointmentTime, message, appointmentType } = req.body;

    // Implementation would go here
    // This would involve creating an appointment record and notifying the agent

    logger.info('Property appointment scheduled', {
      propertyId: id,
      userId,
      appointmentDate,
      appointmentType
    });

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully'
    });
  }
);

/**
 * Submit property review
 */
export const submitReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { rating, comment, reviewType } = req.body;

    // Implementation would go here
    // This would involve creating a review record

    logger.info('Property review submitted', {
      propertyId: id,
      userId,
      rating,
      reviewType
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully'
    });
  }
);

/**
 * Get property reviews
 */
export const getPropertyReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    // Implementation would go here
    // This would involve fetching reviews with pagination

    logger.info('Property reviews retrieved', {
      propertyId: id,
      userId: req.user?.id,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      data: {
        reviews: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      },
      message: 'Reviews retrieved successfully'
    });
  }
);

/**
 * Get featured properties
 */
export const getFeaturedProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = req.query.limit ? Number(req.query.limit) : 12;

    const filters: PropertySearchFilters = {
      status: 'ACTIVE'
    };

    const options: PropertySearchOptions = {
      page: 1,
      limit,
      sortBy: 'views',
      sortOrder: 'desc'
    };

    const result = await propertyService.searchProperties(filters, options);

    logger.info('Featured properties retrieved', {
      userId: req.user?.id,
      resultCount: result.properties.length
    });

    res.status(200).json({
      success: true,
      data: result.properties,
      message: `Found ${result.properties.length} featured properties`
    });
  }
);

/**
 * Get recent properties
 */
export const getRecentProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = req.query.limit ? Number(req.query.limit) : 12;

    const filters: PropertySearchFilters = {
      status: 'ACTIVE'
    };

    const options: PropertySearchOptions = {
      page: 1,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    const result = await propertyService.searchProperties(filters, options);

    logger.info('Recent properties retrieved', {
      userId: req.user?.id,
      resultCount: result.properties.length
    });

    res.status(200).json({
      success: true,
      data: result.properties,
      message: `Found ${result.properties.length} recent properties`
    });
  }
);

/**
 * Get property price history
 */
export const getPriceHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Implementation would go here
    // This would involve fetching price history records

    logger.info('Property price history retrieved', {
      propertyId: id,
      userId: req.user?.id
    });

    res.status(200).json({
      success: true,
      data: [],
      message: 'Price history retrieved successfully'
    });
  }
);