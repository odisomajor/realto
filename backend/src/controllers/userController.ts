/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { userService } from '@/services/userService';
import { catchAsync } from '@/utils/catchAsync';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { 
  UserUpdateRequest, 
  UserSearchFilters, 
  UserPreferences,
  PasswordChangeRequest 
} from '@/types/user';

/**
 * Get current user profile
 */
export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const profile = await userService.getUserProfile(userId, userId);

  res.status(200).json({
    success: true,
    data: profile,
    message: 'Profile retrieved successfully'
  });
});

/**
 * Get user profile by ID
 */
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const requestingUserId = req.user?.id;

  const profile = await userService.getUserProfile(id, requestingUserId);

  res.status(200).json({
    success: true,
    data: profile,
    message: 'User profile retrieved successfully'
  });
});

/**
 * Update user profile
 */
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const updateData: UserUpdateRequest = req.body;
  
  // Remove sensitive fields that shouldn't be updated via this endpoint
  delete updateData.role;
  delete updateData.status;

  const updatedProfile = await userService.updateUserProfile(userId, updateData);

  logger.info(`User profile updated: ${userId}`);

  res.status(200).json({
    success: true,
    data: updatedProfile,
    message: 'Profile updated successfully'
  });
});

/**
 * Update user by ID (Admin only)
 */
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: UserUpdateRequest = req.body;

  const updatedProfile = await userService.updateUserProfile(id, updateData);

  logger.info(`User updated by admin: ${id}`);

  res.status(200).json({
    success: true,
    data: updatedProfile,
    message: 'User updated successfully'
  });
});

/**
 * Search users - Placeholder implementation
 */
export const searchUsers = catchAsync(async (req: Request, res: Response) => {
  // TODO: Implement search functionality
  res.status(200).json({
    success: true,
    data: {
      users: [],
      total: 0,
      page: 1,
      totalPages: 0
    },
    message: 'Search functionality not yet implemented'
  });
});

/**
 * Get user preferences - Placeholder implementation
 */
export const getPreferences = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // TODO: Implement preferences functionality
  res.status(200).json({
    success: true,
    data: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      privacy: {
        showEmail: false,
        showPhone: false
      },
      language: 'en',
      timezone: 'UTC'
    },
    message: 'Preferences functionality not yet implemented'
  });
});

/**
 * Update user preferences - Placeholder implementation
 */
export const updatePreferences = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // TODO: Implement preferences update functionality
  logger.info(`User preferences update requested: ${userId}`);

  res.status(200).json({
    success: true,
    data: req.body,
    message: 'Preferences update functionality not yet implemented'
  });
});

/**
 * Get user activity - Placeholder implementation
 */
export const getActivity = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // TODO: Implement activity functionality
  res.status(200).json({
    success: true,
    data: [],
    message: 'Activity functionality not yet implemented'
  });
});

/**
 * Get user statistics - Placeholder implementation
 */
export const getStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // TODO: Implement statistics functionality
  res.status(200).json({
    success: true,
    data: {
      totalProperties: 0,
      totalInquiries: 0,
      totalAppointments: 0,
      totalFavorites: 0
    },
    message: 'Statistics functionality not yet implemented'
  });
});

/**
 * Get user statistics by ID (for agents/admins)
 */
export const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const stats = await userService.getUserStats(id);

  res.status(200).json({
    success: true,
    data: stats,
    message: 'User statistics retrieved successfully'
  });
});

/**
 * Delete user account
 */
export const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  await userService.deleteUser(userId, userId);

  logger.info(`User account deleted: ${userId}`);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

/**
 * Delete user by ID (Admin only)
 */
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const requestingUserId = req.user?.id;

  if (!requestingUserId) {
    throw new AppError('User not authenticated', 401);
  }

  await userService.deleteUser(id, requestingUserId);

  logger.info(`User deleted by admin: ${id}`);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * Get agents list
 */
export const getAgents = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    agencyId: req.query.agencyId as string,
    city: req.query.city as string,
    state: req.query.state as string,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20
  };

  const agents = await userService.getAgents(filters);

  res.status(200).json({
    success: true,
    data: agents,
    message: 'Agents retrieved successfully'
  });
});

/**
 * Upload avatar
 */
export const uploadAvatar = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // This would typically handle file upload
  // For now, we'll assume the file URL is provided in the request
  const avatarUrl = req.body.avatarUrl;

  if (!avatarUrl) {
    throw new AppError('Avatar URL is required', 400);
  }

  const updatedProfile = await userService.updateUserProfile(userId, {
    avatar: avatarUrl
  });

  logger.info(`Avatar uploaded for user: ${userId}`);

  res.status(200).json({
    success: true,
    data: { avatar: updatedProfile.avatar },
    message: 'Avatar uploaded successfully'
  });
});

/**
 * Change password
 */
export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const { currentPassword, newPassword }: PasswordChangeRequest = req.body;

  // This would typically be handled by the auth service
  // For now, we'll just update the password
  await userService.updateUserProfile(userId, {
    password: newPassword
  });

  logger.info(`Password changed for user: ${userId}`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Get user dashboard data
 */
export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // Get all dashboard data in parallel
  const [profile, stats, activities] = await Promise.all([
    userService.getUserProfile(userId, userId),
    userService.getUserStats(userId),
    userService.getUserActivity(userId, 10)
  ]);

  const dashboard = {
    user: profile,
    stats,
    recentActivity: activities,
    notifications: [], // TODO: Implement notifications
    quickActions: [
      {
        id: 'create-property',
        title: 'Create Property',
        description: 'Add a new property listing',
        icon: 'plus',
        url: '/properties/create',
        color: 'blue',
        isEnabled: true
      },
      {
        id: 'view-inquiries',
        title: 'View Inquiries',
        description: 'Check new inquiries',
        icon: 'message',
        url: '/inquiries',
        color: 'green',
        isEnabled: true
      },
      {
        id: 'schedule-appointment',
        title: 'Appointments',
        description: 'Manage appointments',
        icon: 'calendar',
        url: '/appointments',
        color: 'purple',
        isEnabled: true
      }
    ]
  };

  res.status(200).json({
    success: true,
    data: dashboard,
    message: 'Dashboard data retrieved successfully'
  });
});

/**
 * Export user data
 */
export const exportUserData = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // This would typically generate a comprehensive export
  // For now, we'll return basic profile data
  const profile = await userService.getUserProfile(userId, userId);
  const preferences = await userService.getUserPreferences(userId);
  const activities = await userService.getUserActivity(userId, 100);
  const stats = await userService.getUserStats(userId);

  const exportData = {
    profile,
    preferences,
    activities,
    stats,
    exportedAt: new Date(),
    exportedBy: userId
  };

  logger.info(`User data exported: ${userId}`);

  res.status(200).json({
    success: true,
    data: exportData,
    message: 'User data exported successfully'
  });
});

/**
 * Deactivate account
 */
export const deactivateAccount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  await userService.updateUserProfile(userId, {
    isActive: false
  });

  logger.info(`User account deactivated: ${userId}`);

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

/**
 * Reactivate account
 */
export const reactivateAccount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  await userService.updateUserProfile(userId, {
    isActive: true
  });

  logger.info(`User account reactivated: ${userId}`);

  res.status(200).json({
    success: true,
    message: 'Account reactivated successfully'
  });
});

/**
 * Get user notifications
 */
export const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // TODO: Implement notification service
  const notifications = [];

  res.status(200).json({
    success: true,
    data: notifications,
    message: 'Notifications retrieved successfully'
  });
});

/**
 * Mark notification as read
 */
export const markNotificationRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { notificationId } = req.params;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // TODO: Implement notification service
  logger.info(`Notification marked as read: ${notificationId} by user: ${userId}`);

  res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
});

/**
 * Get user sessions
 */
export const getSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // TODO: Implement session management
  const sessions = [];

  res.status(200).json({
    success: true,
    data: sessions,
    message: 'Sessions retrieved successfully'
  });
});

/**
 * Revoke session
 */
export const revokeSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { sessionId } = req.params;
  
  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  // TODO: Implement session revocation
  logger.info(`Session revoked: ${sessionId} by user: ${userId}`);

  res.status(200).json({
    success: true,
    message: 'Session revoked successfully'
  });
});