import { PrismaClient, Property, PropertyStatus, PropertyType, ListingType } from '@prisma/client';
import { 
  PropertySearchFilters, 
  PropertySearchOptions, 
  PropertySearchResult,
  PropertySummary,
  PropertyDetails,
  PropertyCreateRequest,
  PropertyUpdateRequest,
  PropertyInquiry,
  PropertyAppointment,
  PropertyAnalytics,
  MarketAnalytics
} from '@/types/property';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { cache } from '@/config/database';

const prisma = new PrismaClient();

export class PropertyService {
  /**
   * Search properties with filters and pagination
   */
  async searchProperties(
    filters: PropertySearchFilters,
    options: PropertySearchOptions = {}
  ): Promise<PropertySearchResult> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        includeInactive = false
      } = options;

      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: any = {
        ...(filters.propertyType && { propertyType: filters.propertyType }),
        ...(filters.listingType && { listingType: filters.listingType }),
        ...(filters.status && { status: filters.status }),
        ...(filters.minPrice && { price: { gte: filters.minPrice } }),
        ...(filters.maxPrice && { price: { ...where.price, lte: filters.maxPrice } }),
        ...(filters.minBedrooms && { bedrooms: { gte: filters.minBedrooms } }),
        ...(filters.maxBedrooms && { bedrooms: { ...where.bedrooms, lte: filters.maxBedrooms } }),
        ...(filters.minBathrooms && { bathrooms: { gte: filters.minBathrooms } }),
        ...(filters.maxBathrooms && { bathrooms: { ...where.bathrooms, lte: filters.maxBathrooms } }),
        ...(filters.minSquareFootage && { squareFootage: { gte: filters.minSquareFootage } }),
        ...(filters.maxSquareFootage && { squareFootage: { ...where.squareFootage, lte: filters.maxSquareFootage } }),
        ...(filters.yearBuiltFrom && { yearBuilt: { gte: filters.yearBuiltFrom } }),
        ...(filters.yearBuiltTo && { yearBuilt: { ...where.yearBuilt, lte: filters.yearBuiltTo } }),
        ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
        ...(filters.state && { state: { contains: filters.state, mode: 'insensitive' } }),
        ...(filters.zipCode && { zipCode: filters.zipCode }),
        ...(filters.neighborhood && { neighborhood: { contains: filters.neighborhood, mode: 'insensitive' } }),
        ...(filters.features && filters.features.length > 0 && {
          features: { hasSome: filters.features }
        }),
        ...(filters.amenities && filters.amenities.length > 0 && {
          amenities: { hasSome: filters.amenities }
        }),
        ...(filters.agentId && { agentId: filters.agentId }),
        ...(filters.agencyId && { agencyId: filters.agencyId }),
        ...(!includeInactive && { status: { not: 'INACTIVE' } })
      };

      // Handle location-based search
      if (filters.latitude && filters.longitude && filters.radius) {
        // Note: This is a simplified distance calculation
        // In production, you might want to use PostGIS or similar
        const latRange = filters.radius / 69; // Rough miles to degrees conversion
        const lonRange = filters.radius / (69 * Math.cos(filters.latitude * Math.PI / 180));
        
        where.latitude = {
          gte: filters.latitude - latRange,
          lte: filters.latitude + latRange
        };
        where.longitude = {
          gte: filters.longitude - lonRange,
          lte: filters.longitude + lonRange
        };
      }

      // Handle text search
      if (filters.searchQuery) {
        where.OR = [
          { title: { contains: filters.searchQuery, mode: 'insensitive' } },
          { description: { contains: filters.searchQuery, mode: 'insensitive' } },
          { address: { contains: filters.searchQuery, mode: 'insensitive' } },
          { city: { contains: filters.searchQuery, mode: 'insensitive' } },
          { neighborhood: { contains: filters.searchQuery, mode: 'insensitive' } }
        ];
      }

      // Execute search with count
      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            images: {
              take: 1,
              orderBy: { order: 'asc' }
            },
            agent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatar: true
              }
            },
            agency: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            },
            _count: {
              select: {
                favorites: true,
                inquiries: true,
                reviews: true
              }
            }
          }
        }),
        prisma.property.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        properties: properties.map(this.formatPropertySummary),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPreviousPage
        },
        filters: filters
      };
    } catch (error) {
      logger.error('Error searching properties', { error, filters, options });
      throw new AppError('Failed to search properties', 500);
    }
  }

  /**
   * Get property by ID with full details
   */
  async getPropertyById(id: string, userId?: string): Promise<PropertyDetails> {
    try {
      // Check cache first
      const cacheKey = `property:${id}:${userId || 'anonymous'}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          images: { orderBy: { order: 'asc' } },
          videos: { orderBy: { order: 'asc' } },
          documents: true,
          virtualTours: true,
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
              bio: true,
              licenseNumber: true,
              specializations: true,
              languages: true,
              socialMedia: true
            }
          },
          agency: {
            select: {
              id: true,
              name: true,
              logo: true,
              phone: true,
              email: true,
              website: true,
              address: true
            }
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          priceHistory: {
            orderBy: { createdAt: 'desc' },
            take: 20
          },
          _count: {
            select: {
              favorites: true,
              inquiries: true,
              reviews: true,
              appointments: true
            }
          }
        }
      });

      if (!property) {
        throw new AppError('Property not found', 404);
      }

      // Check if user has favorited this property
      let isFavorited = false;
      if (userId) {
        const favorite = await prisma.favorite.findUnique({
          where: {
            userId_propertyId: {
              userId,
              propertyId: id
            }
          }
        });
        isFavorited = !!favorite;
      }

      // Increment view count
      await prisma.property.update({
        where: { id },
        data: { views: { increment: 1 } }
      });

      const propertyDetails = this.formatPropertyDetails(property, isFavorited);

      // Cache for 5 minutes
      await cache.set(cacheKey, JSON.stringify(propertyDetails), 300);

      return propertyDetails;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error getting property by ID', { error, id, userId });
      throw new AppError('Failed to get property', 500);
    }
  }

  /**
   * Create a new property
   */
  async createProperty(data: PropertyCreateRequest, agentId: string): Promise<PropertyDetails> {
    try {
      const property = await prisma.property.create({
        data: {
          ...data,
          agentId,
          slug: this.generateSlug(data.title),
          status: PropertyStatus.PENDING
        },
        include: {
          images: { orderBy: { order: 'asc' } },
          videos: { orderBy: { order: 'asc' } },
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true
            }
          },
          agency: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          }
        }
      });

      logger.info('Property created', { propertyId: property.id, agentId });

      return this.formatPropertyDetails(property, false);
    } catch (error) {
      logger.error('Error creating property', { error, data, agentId });
      throw new AppError('Failed to create property', 500);
    }
  }

  /**
   * Update property
   */
  async updateProperty(
    id: string, 
    data: PropertyUpdateRequest, 
    userId: string
  ): Promise<PropertyDetails> {
    try {
      // Check if property exists and user has permission
      const existingProperty = await prisma.property.findUnique({
        where: { id },
        select: { agentId: true, agencyId: true }
      });

      if (!existingProperty) {
        throw new AppError('Property not found', 404);
      }

      // Check permissions (agent owns property or admin)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, agencyId: true }
      });

      const canUpdate = 
        existingProperty.agentId === userId ||
        (user?.role === 'ADMIN' && existingProperty.agencyId === user.agencyId) ||
        user?.role === 'SUPER_ADMIN';

      if (!canUpdate) {
        throw new AppError('Insufficient permissions to update this property', 403);
      }

      const updatedProperty = await prisma.property.update({
        where: { id },
        data: {
          ...data,
          ...(data.title && { slug: this.generateSlug(data.title) }),
          updatedAt: new Date()
        },
        include: {
          images: { orderBy: { order: 'asc' } },
          videos: { orderBy: { order: 'asc' } },
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true
            }
          },
          agency: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          }
        }
      });

      // Clear cache
      await cache.del(`property:${id}:*`);

      logger.info('Property updated', { propertyId: id, userId });

      return this.formatPropertyDetails(updatedProperty, false);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error updating property', { error, id, data, userId });
      throw new AppError('Failed to update property', 500);
    }
  }

  /**
   * Delete property
   */
  async deleteProperty(id: string, userId: string): Promise<void> {
    try {
      // Check if property exists and user has permission
      const existingProperty = await prisma.property.findUnique({
        where: { id },
        select: { agentId: true, agencyId: true }
      });

      if (!existingProperty) {
        throw new AppError('Property not found', 404);
      }

      // Check permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, agencyId: true }
      });

      const canDelete = 
        existingProperty.agentId === userId ||
        (user?.role === 'ADMIN' && existingProperty.agencyId === user.agencyId) ||
        user?.role === 'SUPER_ADMIN';

      if (!canDelete) {
        throw new AppError('Insufficient permissions to delete this property', 403);
      }

      await prisma.property.delete({
        where: { id }
      });

      // Clear cache
      await cache.del(`property:${id}:*`);

      logger.info('Property deleted', { propertyId: id, userId });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error deleting property', { error, id, userId });
      throw new AppError('Failed to delete property', 500);
    }
  }

  /**
   * Get properties by agent
   */
  async getPropertiesByAgent(
    agentId: string,
    options: PropertySearchOptions = {}
  ): Promise<PropertySearchResult> {
    try {
      const filters: PropertySearchFilters = { agentId };
      return await this.searchProperties(filters, options);
    } catch (error) {
      logger.error('Error getting properties by agent', { error, agentId, options });
      throw new AppError('Failed to get agent properties', 500);
    }
  }

  /**
   * Get similar properties
   */
  async getSimilarProperties(
    propertyId: string,
    limit: number = 6
  ): Promise<PropertySummary[]> {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: {
          propertyType: true,
          price: true,
          bedrooms: true,
          bathrooms: true,
          city: true,
          state: true,
          zipCode: true
        }
      });

      if (!property) {
        throw new AppError('Property not found', 404);
      }

      const priceRange = property.price * 0.2; // 20% price range

      const similarProperties = await prisma.property.findMany({
        where: {
          id: { not: propertyId },
          propertyType: property.propertyType,
          price: {
            gte: property.price - priceRange,
            lte: property.price + priceRange
          },
          OR: [
            { city: property.city },
            { zipCode: property.zipCode },
            { 
              AND: [
                { bedrooms: property.bedrooms },
                { bathrooms: property.bathrooms }
              ]
            }
          ],
          status: 'ACTIVE'
        },
        take: limit,
        include: {
          images: {
            take: 1,
            orderBy: { order: 'asc' }
          },
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          _count: {
            select: {
              favorites: true,
              reviews: true
            }
          }
        },
        orderBy: [
          { city: property.city ? 'asc' : 'desc' },
          { createdAt: 'desc' }
        ]
      });

      return similarProperties.map(this.formatPropertySummary);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error getting similar properties', { error, propertyId, limit });
      throw new AppError('Failed to get similar properties', 500);
    }
  }

  /**
   * Get property analytics
   */
  async getPropertyAnalytics(propertyId: string): Promise<PropertyAnalytics> {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          _count: {
            select: {
              favorites: true,
              inquiries: true,
              reviews: true,
              appointments: true
            }
          }
        }
      });

      if (!property) {
        throw new AppError('Property not found', 404);
      }

      // Get view analytics (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Note: This would require a separate analytics table in production
      const analytics: PropertyAnalytics = {
        propertyId,
        views: property.views,
        favorites: property._count.favorites,
        inquiries: property._count.inquiries,
        appointments: property._count.appointments,
        reviews: property._count.reviews,
        averageRating: 0, // Calculate from reviews
        viewsLast30Days: 0, // Would need analytics table
        inquiriesLast30Days: 0, // Would need analytics table
        appointmentsLast30Days: 0, // Would need analytics table
        conversionRate: 0, // Calculate based on views vs inquiries
        daysOnMarket: Math.floor(
          (new Date().getTime() - property.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
        pricePerSquareFoot: property.squareFootage 
          ? Math.round(property.price / property.squareFootage)
          : null,
        marketComparison: {
          averagePrice: 0,
          averageDaysOnMarket: 0,
          totalListings: 0
        }
      };

      return analytics;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error getting property analytics', { error, propertyId });
      throw new AppError('Failed to get property analytics', 500);
    }
  }

  /**
   * Format property summary for search results
   */
  private formatPropertySummary(property: any): PropertySummary {
    return {
      id: property.id,
      title: property.title,
      slug: property.slug,
      propertyType: property.propertyType,
      listingType: property.listingType,
      status: property.status,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFootage: property.squareFootage,
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      latitude: property.latitude,
      longitude: property.longitude,
      mainImage: property.images[0]?.url || null,
      agent: property.agent,
      agency: property.agency,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      stats: {
        views: property.views,
        favorites: property._count?.favorites || 0,
        inquiries: property._count?.inquiries || 0,
        reviews: property._count?.reviews || 0
      }
    };
  }

  /**
   * Format property details
   */
  private formatPropertyDetails(property: any, isFavorited: boolean): PropertyDetails {
    return {
      ...this.formatPropertySummary(property),
      description: property.description,
      yearBuilt: property.yearBuilt,
      lotSize: property.lotSize,
      parkingSpaces: property.parkingSpaces,
      features: property.features,
      amenities: property.amenities,
      neighborhood: property.neighborhood,
      schoolDistrict: property.schoolDistrict,
      hoaFees: property.hoaFees,
      propertyTaxes: property.propertyTaxes,
      images: property.images,
      videos: property.videos,
      documents: property.documents,
      virtualTours: property.virtualTours,
      reviews: property.reviews,
      priceHistory: property.priceHistory,
      isFavorited,
      stats: {
        views: property.views,
        favorites: property._count?.favorites || 0,
        inquiries: property._count?.inquiries || 0,
        reviews: property._count?.reviews || 0,
        appointments: property._count?.appointments || 0
      }
    };
  }

  /**
   * Generate slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export const propertyService = new PropertyService();