import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '@/utils/logger';
import { redis } from '@/config/redis';
import { AppError } from '@/utils/errors';
import { 
  UserProfile, 
  UserUpdateRequest, 
  UserSearchFilters, 
  UserSearchResult,
  UserPreferences,
  UserActivity,
  UserStats,
  UserRole,
  UserStatus
} from '@/types/user';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string, requestingUserId?: string): Promise<UserProfile> {
    try {
      const cacheKey = `user:profile:${userId}`;
      
      // Check cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          agency: {
            select: {
              id: true,
              name: true,
              logo: true,
              website: true
            }
          },
          _count: {
            select: {
              properties: true,
              reviews: true,
              inquiries: true,
              appointments: true,
              favorites: true
            }
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if user is viewing their own profile or has permission
      const isOwnProfile = requestingUserId === userId;
      const canViewFullProfile = isOwnProfile || this.hasAdminPermission(requestingUserId);

      const profile: UserProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: canViewFullProfile ? user.email : undefined,
        phone: canViewFullProfile ? user.phone : undefined,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        bio: user.bio,
        specialties: user.specialties,
        languages: user.languages,
        licenseNumber: user.licenseNumber,
        yearsOfExperience: user.yearsOfExperience,
        agency: user.agency,
        socialMedia: user.socialMedia,
        isEmailVerified: canViewFullProfile ? user.isEmailVerified : undefined,
        isPhoneVerified: canViewFullProfile ? user.isPhoneVerified : undefined,
        lastLoginAt: canViewFullProfile ? user.lastLoginAt : undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats: {
          propertiesCount: user._count.properties,
          reviewsCount: user._count.reviews,
          inquiriesCount: user._count.inquiries,
          appointmentsCount: user._count.appointments,
          favoritesCount: user._count.favorites
        }
      };

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(profile));

      return profile;
    } catch (error) {
      logger.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updateData: UserUpdateRequest): Promise<UserProfile> {
    try {
      // Validate update permissions
      if (updateData.role && !this.hasAdminPermission(userId)) {
        throw new AppError('Insufficient permissions to update role', 403);
      }

      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          agency: {
            select: {
              id: true,
              name: true,
              logo: true,
              website: true
            }
          },
          _count: {
            select: {
              properties: true,
              reviews: true,
              inquiries: true,
              appointments: true,
              favorites: true
            }
          }
        }
      });

      // Clear cache
      await redis.del(`user:profile:${userId}`);

      const profile: UserProfile = {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        status: updatedUser.status,
        bio: updatedUser.bio,
        specialties: updatedUser.specialties,
        languages: updatedUser.languages,
        licenseNumber: updatedUser.licenseNumber,
        yearsOfExperience: updatedUser.yearsOfExperience,
        agency: updatedUser.agency,
        socialMedia: updatedUser.socialMedia,
        isEmailVerified: updatedUser.isEmailVerified,
        isPhoneVerified: updatedUser.isPhoneVerified,
        lastLoginAt: updatedUser.lastLoginAt,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        stats: {
          propertiesCount: updatedUser._count.properties,
          reviewsCount: updatedUser._count.reviews,
          inquiriesCount: updatedUser._count.inquiries,
          appointmentsCount: updatedUser._count.appointments,
          favoritesCount: updatedUser._count.favorites
        }
      };

      logger.info(`User profile updated: ${userId}`);
      return profile;
    } catch (error) {
      logger.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    // TODO: Implement preferences functionality
    return {
      searchPreferences: {},
      notificationSettings: {
        email: true,
        sms: false,
        push: true,
        marketing: false,
        newListings: true,
        priceChanges: true,
        appointments: true,
        inquiries: true,
        reviews: true,
        systemUpdates: false
      },
      displaySettings: {
        theme: 'light',
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        measurementUnit: 'imperial'
      },
      privacySettings: {
        showEmail: false,
        showPhone: false,
        allowDirectMessages: true,
        showOnlineStatus: true,
        allowProfileViewing: true,
        showActivityStatus: false
      }
    };
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId: string, limit: number = 50): Promise<UserActivity[]> {
    // TODO: Implement activity functionality
    return [];
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              properties: true,
              inquiries: true,
              appointments: true,
              favorites: true,
              reviews: true
            }
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return {
        totalProperties: user._count.properties,
        totalInquiries: user._count.inquiries,
        totalAppointments: user._count.appointments,
        totalFavorites: user._count.favorites,
        totalReviews: user._count.reviews,
        averageRating: 0, // TODO: Calculate from reviews
        responseRate: 0, // TODO: Calculate response rate
        responseTime: 0, // TODO: Calculate average response time
        profileViews: 0, // TODO: Implement profile view tracking
        listingViews: 0, // TODO: Calculate from property views
        conversionRate: 0, // TODO: Calculate conversion rate
        activeListings: 0, // TODO: Count active properties
        soldListings: 0, // TODO: Count sold properties
        rentedListings: 0 // TODO: Count rented properties
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Check if user has admin permission
   */
  private async hasAdminPermission(userId?: string): Promise<boolean> {
    if (!userId) return false;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    } catch {
      return false;
    }
  }
}

export const userService = new UserService();