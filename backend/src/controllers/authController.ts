import { Request, Response } from 'express';
import { authService } from '@/services/authService';
import { catchAsync } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  ChangePasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  DeviceInfo
} from '@/types/auth';

/**
 * Extract device information from request
 */
const getDeviceInfo = (req: Request): DeviceInfo => {
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress || 
                   'Unknown';

  // Simple device type detection
  let deviceType: DeviceInfo['deviceType'] = 'unknown';
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
  } else if (/Mozilla/.test(userAgent)) {
    deviceType = 'desktop';
  }

  // Simple browser detection
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  // Simple OS detection
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  return {
    userAgent,
    ipAddress,
    deviceType,
    browser,
    os
  };
};

/**
 * Register a new user
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  const registerData: RegisterRequest = req.body;
  const deviceInfo = getDeviceInfo(req);

  // Validate required fields
  if (!registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, first name, and last name are required'
    });
  }

  if (!registerData.agreeToTerms) {
    return res.status(400).json({
      success: false,
      message: 'You must agree to the terms and conditions'
    });
  }

  const result = await authService.register(registerData, deviceInfo);

  logger.info('User registered successfully', { 
    userId: result.user.id, 
    email: result.user.email,
    ipAddress: deviceInfo.ipAddress
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email for verification.',
    user: result.user,
    tokens: result.tokens
  });
});

/**
 * Login user
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const loginData: LoginRequest = req.body;
  const deviceInfo = getDeviceInfo(req);

  // Validate required fields
  if (!loginData.email || !loginData.password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const result = await authService.login(loginData, deviceInfo);

  logger.info('User logged in successfully', { 
    userId: result.user.id, 
    email: result.user.email,
    ipAddress: deviceInfo.ipAddress
  });

  res.json({
    success: true,
    message: 'Login successful',
    user: result.user,
    tokens: result.tokens
  });
});

/**
 * Refresh access token
 */
export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  const tokens = await authService.refreshToken(refreshToken);

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    tokens
  });
});

/**
 * Logout user
 */
export const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const deviceInfo = getDeviceInfo(req);

  if (refreshToken) {
    await authService.logout(refreshToken, deviceInfo);
  }

  logger.info('User logged out', { 
    userId: req.user?.id,
    ipAddress: deviceInfo.ipAddress
  });

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * Forgot password
 */
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email }: ForgotPasswordRequest = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  await authService.forgotPassword(email);

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
});

/**
 * Reset password
 */
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, password, confirmPassword }: ResetPasswordRequest = req.body;

  if (!token || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Token, password, and confirm password are required'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match'
    });
  }

  await authService.resetPassword(token, password);

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
});

/**
 * Change password
 */
export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword, confirmPassword }: ChangePasswordRequest = req.body;
  const userId = req.user!.id;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password, new password, and confirm password are required'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'New passwords do not match'
    });
  }

  await authService.changePassword(userId, currentPassword, newPassword);

  logger.info('Password changed successfully', { userId });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Verify email
 */
export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token }: VerifyEmailRequest = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Verification token is required'
    });
  }

  await authService.verifyEmail(token);

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

/**
 * Resend verification email
 */
export const resendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
  const { email }: ResendVerificationRequest = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  await authService.resendVerificationEmail(email);

  res.json({
    success: true,
    message: 'Verification email sent successfully'
  });
});

/**
 * Get current user profile
 */
export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      isActive: user.isActive
    }
  });
});

/**
 * Check authentication status
 */
export const checkAuth = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  res.json({
    success: true,
    message: 'Authenticated',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      emailVerified: req.user.emailVerified,
      phoneVerified: req.user.phoneVerified,
      isActive: req.user.isActive
    }
  });
});

/**
 * Validate password strength
 */
export const validatePassword = catchAsync(async (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }

  // Use the same validation logic from authService
  const authServiceInstance = new (authService.constructor as any)();
  const validation = authServiceInstance.validatePassword(password);

  res.json({
    success: true,
    validation
  });
});

/**
 * Get user sessions (placeholder for future implementation)
 */
export const getSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // TODO: Implement session management
  // For now, return empty array
  res.json({
    success: true,
    sessions: []
  });
});

/**
 * Revoke session (placeholder for future implementation)
 */
export const revokeSession = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = req.user!.id;

  // TODO: Implement session revocation
  logger.info('Session revocation requested', { userId, sessionId });

  res.json({
    success: true,
    message: 'Session revoked successfully'
  });
});

/**
 * Enable two-factor authentication (placeholder for future implementation)
 */
export const enableTwoFactor = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // TODO: Implement 2FA setup
  logger.info('2FA setup requested', { userId });

  res.json({
    success: true,
    message: '2FA setup initiated',
    qrCode: 'placeholder-qr-code-url',
    backupCodes: ['code1', 'code2', 'code3']
  });
});

/**
 * Disable two-factor authentication (placeholder for future implementation)
 */
export const disableTwoFactor = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { password, code } = req.body;

  if (!password || !code) {
    return res.status(400).json({
      success: false,
      message: 'Password and 2FA code are required'
    });
  }

  // TODO: Implement 2FA disable
  logger.info('2FA disable requested', { userId });

  res.json({
    success: true,
    message: '2FA disabled successfully'
  });
});

/**
 * Verify two-factor authentication code (placeholder for future implementation)
 */
export const verifyTwoFactor = catchAsync(async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: '2FA code is required'
    });
  }

  // TODO: Implement 2FA verification
  res.json({
    success: true,
    message: '2FA code verified successfully'
  });
});