import { PrismaClient, Property } from '@prisma/client';
import { PropertyStatus, PropertyType, ListingType } from '../types/property';
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
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { config } from '@/config/database';

const { cache } = config;

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
        ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
        ...(filters.county && { county: { contains: filters.county, mode: 'insensitive' } }),
        ...(filters.features && filters.features.length > 0 && {
          features: { hasSome: filters.features }
        }),
        ...(filters.amenities && filters.amenities.length > 0 && {
          amenities: { hasSome: filters.amenities }
        }),
        ...(filters.agentId && { ownerId: filters.agentId }),
        // TODO: Add agency relationship to schema if needed
        // ...(filters.agencyId && { agencyId: filters.agencyId }),
        ...(!includeInactive && { status: { not: 'INACTIVE' } })
      };

      // Handle price range
      if (filters.minPrice || filters.maxPrice) {
        where.price = {
          ...(filters.minPrice && { gte: filters.minPrice }),
          ...(filters.maxPrice && { lte: filters.maxPrice })
        };
      }

      // Handle bedroom range
      if (filters.minBedrooms || filters.maxBedrooms) {
        where.bedrooms = {
          ...(filters.minBedrooms && { gte: filters.minBedrooms }),
          ...(filters.maxBedrooms && { lte: filters.maxBedrooms })
        };
      }

      // Handle bathroom range
      if (filters.minBathrooms || filters.maxBathrooms) {
        where.bathrooms = {
          ...(filters.minBathrooms && { gte: filters.minBathrooms }),
          ...(filters.maxBathrooms && { lte: filters.maxBathrooms })
        };
      }

      // Handle square footage range
      if (filters.minSquareFootage || filters.maxSquareFootage) {
        where.squareFootage = {
          ...(filters.minSquareFootage && { gte: filters.minSquareFootage }),
          ...(filters.maxSquareFootage && { lte: filters.maxSquareFootage })
        };
      }

      // Handle year built range
      if (filters.yearBuiltFrom || filters.yearBuiltTo) {
        where.yearBuilt = {
          ...(filters.yearBuiltFrom && { gte: filters.yearBuiltFrom }),
          ...(filters.yearBuiltTo && { lte: filters.yearBuiltTo })
        };
      }

      // Handle location-based search
      if (filters.coordinates && filters.radius) {
        // Note: This is a simplified distance calculation
        // In production, you might want to use PostGIS or similar
        const latRange = filters.radius / 69; // Rough miles to degrees conversion
        const lonRange = filters.radius / (69 * Math.cos(filters.coordinates.lat * Math.PI / 180));
        
        where.latitude = {
          gte: filters.coordinates.lat - latRange,
          lte: filters.coordinates.lat + latRange
        };
        where.longitude = {
          gte: filters.coordinates.lng - lonRange,
          lte: filters.coordinates.lng + lonRange
        };
      }

      // TODO: Add text search functionality when searchQuery field is added to PropertySearchFilters interface

      // Execute search with count
      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatar: true
              }
            },
            _count: {
              select: {
                favorites: true,
                inquiries: true
              }
            }
          }
        }) as any,
        prisma.property.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        properties: properties.map(this.formatPropertySummary),
        total,
        page,
        limit,
        totalPages,
        hasNext: hasNextPage,
        hasPrev: hasPreviousPage,
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
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true
            }
          },
          _count: {
            select: {
              favorites: true,
              inquiries: true
            }
          }
        }
      }) as any;

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
  async createProperty(data: PropertyCreateRequest, ownerId: string): Promise<PropertyDetails> {
    try {
      // Transform data to match Prisma schema
      const { agentId, agencyId, ...validData } = data;
      const property = await prisma.property.create({
        data: {
          ...validData,
          ownerId: ownerId,
          slug: this.generateSlug(data.title),
          status: PropertyStatus.PENDING,
          // Convert arrays to JSON strings for SQLite
          features: data.features ? JSON.stringify(data.features) : null,
          amenities: data.amenities ? JSON.stringify(data.amenities) : null,
          images: data.images ? JSON.stringify(data.images) : null
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true
            }
          }
        }
      });

      logger.info('Property created', { propertyId: property.id, ownerId });

      return this.formatPropertyDetails(property, false);
    } catch (error) {
      logger.error('Error creating property', { error, data, ownerId });
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
        select: { ownerId: true }
      });

      if (!existingProperty) {
        throw new AppError('Property not found', 404);
      }

      // Check permissions (owner or admin)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      const canUpdate = 
        existingProperty.ownerId === userId ||
        user?.role === 'ADMIN' ||
        user?.role === 'SUPER_ADMIN';

      if (!canUpdate) {
        throw new AppError('Insufficient permissions to update this property', 403);
      }

      // Transform data to match Prisma schema
      const { agentId, agencyId, ...validData } = data;
      const updateData: any = {
        ...validData,
        ...(data.title && { slug: this.generateSlug(data.title) }),
        updatedAt: new Date()
      };
      
      // Convert arrays to JSON strings for SQLite if they exist
      if (data.features) updateData.features = JSON.stringify(data.features);
      if (data.amenities) updateData.amenities = JSON.stringify(data.amenities);
      if (data.images) updateData.images = JSON.stringify(data.images);
      
      const updatedProperty = await prisma.property.update({
        where: { id },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true
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
        select: { ownerId: true }
      });

      if (!existingProperty) {
        throw new AppError('Property not found', 404);
      }

      // Check permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      const canDelete = 
        existingProperty.ownerId === userId ||
        user?.role === 'ADMIN' ||
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
   * Get properties by owner
   */
  async getPropertiesByOwner(
    ownerId: string,
    options: PropertySearchOptions = {}
  ): Promise<PropertySearchResult> {
    try {
      const filters: PropertySearchFilters = { agentId: ownerId };
      return await this.searchProperties(filters, options);
    } catch (error) {
      logger.error('Error getting properties by owner', { error, ownerId, options });
      throw new AppError('Failed to get owner properties', 500);
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
          county: true
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
            { county: property.county },
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
          owner: {
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
              inquiries: true
            }
          }
        },
        orderBy: [
          { city: property.city ? 'asc' : 'desc' },
          { createdAt: 'desc' }
        ]
      }) as any;

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
              inquiries: true
            }
          }
        }
      }) as any;

      if (!property) {
        throw new AppError('Property not found', 404);
      }

      // Get view analytics (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Note: This would require a separate analytics table in production
      const analytics: PropertyAnalytics = {
        propertyId,
        views: {
          total: property.views || 0,
          unique: property.views || 0, // TODO: Calculate unique views
          thisWeek: 0, // TODO: Calculate from analytics table
          thisMonth: 0, // TODO: Calculate from analytics table
          trend: 'stable' as const
        },
        favorites: {
          total: property._count.favorites,
          thisWeek: 0, // TODO: Calculate from analytics table
          thisMonth: 0 // TODO: Calculate from analytics table
        },
        inquiries: {
          total: property._count.inquiries,
          thisWeek: 0, // TODO: Calculate from analytics table
          thisMonth: 0, // TODO: Calculate from analytics table
          conversionRate: 0 // TODO: Calculate based on views vs inquiries
        },
        performance: {
          daysOnMarket: Math.floor(
            (new Date().getTime() - property.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          ),
          priceChanges: 0, // TODO: Calculate from price history
          averageViewTime: 0, // TODO: Calculate from analytics
          bounceRate: 0 // TODO: Calculate from analytics
        },
        demographics: {
          topCities: {}, // TODO: Calculate from visitor data
          ageGroups: {}, // TODO: Calculate from visitor data
          deviceTypes: {} // TODO: Calculate from visitor data
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
    const images = property.images ? JSON.parse(property.images) : [];
    return {
      id: property.id,
      title: property.title,
      slug: property.slug,
      propertyType: property.propertyType,
      listingType: property.listingType,
      status: property.status,
      price: property.price,
      currency: property.currency,
      pricePerSqft: property.squareFootage ? property.price / property.squareFootage : undefined,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFootage: property.squareFootage,
      yearBuilt: property.yearBuilt,
      address: property.address,
      city: property.city,
      county: property.county,
      coordinates: {
        lat: property.latitude || 0,
        lng: property.longitude || 0
      },
      mainImage: images[0]?.url || null,
      imageCount: images.length,
      hasVirtualTour: !!property.virtualTour,
      hasVideo: false, // TODO: Add video support
      agent: property.owner ? {
        id: property.owner.id,
        firstName: property.owner.firstName,
        lastName: property.owner.lastName,
        avatar: property.owner.avatar,
        phone: property.owner.phone
      } : undefined,
      viewCount: 0, // TODO: Implement view tracking
      favoriteCount: property._count?.favorites || 0,
      inquiryCount: property._count?.inquiries || 0,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
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
      features: property.features ? JSON.parse(property.features) : [],
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      appliances: [], // TODO: Add appliances field to schema
      utilities: [], // TODO: Add utilities field to schema
      flooring: [], // TODO: Add flooring field to schema
      renovated: false, // TODO: Add renovated field to schema
      images: property.images ? JSON.parse(property.images) : [],
      videos: [], // TODO: Add videos field to schema
      virtualTour: property.virtualTour,
      keywords: [], // TODO: Add keywords field to schema
      reviewCount: 0 // TODO: Implement reviews
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