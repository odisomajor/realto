import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient, User, UserRole } from '@prisma/client';
import { 
  JWTPayload, 
  RefreshTokenPayload, 
  AuthTokens, 
  LoginRequest, 
  RegisterRequest, 
  AuthUser,
  PasswordValidation,
  SecurityEvent,
  DeviceInfo
} from '@/types/auth';
import authConfig from '@/config/auth';
import { logger } from '@/utils/logger';
import { cache } from '@/config/database';
import { AppError } from '@/middleware/errorHandler';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest, deviceInfo: DeviceInfo): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    try {
      // Validate password strength
      const passwordValidation = this.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new AppError('Password does not meet requirements', 400, passwordValidation.errors);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (existingUser) {
        throw new AppError('User already exists with this email', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, authConfig.bcrypt.saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role || UserRole.USER,
        }
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Log security event
      await this.logSecurityEvent({
        userId: user.id,
        type: 'login',
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        details: { action: 'register' }
      });

      // Send verification email (async)
      this.sendVerificationEmail(user.email, user.id).catch(error => {
        logger.error('Failed to send verification email', { error, userId: user.id });
      });

      const authUser = this.transformToAuthUser(user);
      
      logger.info('User registered successfully', { userId: user.id, email: user.email });
      
      return { user: authUser, tokens };
    } catch (error) {
      logger.error('Registration failed', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginRequest, deviceInfo: DeviceInfo): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    try {
      // Check rate limiting
      await this.checkRateLimit(data.email, deviceInfo.ipAddress);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (!user) {
        await this.recordFailedLogin(data.email, deviceInfo, 'user_not_found');
        throw new AppError('Invalid credentials', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        await this.recordFailedLogin(data.email, deviceInfo, 'account_disabled');
        throw new AppError('Account is disabled', 403);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        await this.recordFailedLogin(data.email, deviceInfo, 'invalid_password');
        throw new AppError('Invalid credentials', 401);
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Clear rate limit
      await this.clearRateLimit(data.email, deviceInfo.ipAddress);

      // Log security event
      await this.logSecurityEvent({
        userId: user.id,
        type: 'login',
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        details: { success: true }
      });

      const authUser = this.transformToAuthUser(user);
      
      logger.info('User logged in successfully', { userId: user.id, email: user.email });
      
      return { user: authUser, tokens };
    } catch (error) {
      logger.error('Login failed', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, authConfig.jwt.refreshSecret) as RefreshTokenPayload;

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new AppError('Invalid or expired refresh token', 401);
      }

      // Check if user is still active
      if (!storedToken.user.isActive) {
        throw new AppError('Account is disabled', 403);
      }

      // Generate new tokens
      const tokens = await this.generateTokens(storedToken.user);

      // Remove old refresh token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id }
      });

      logger.info('Token refreshed successfully', { userId: storedToken.user.id });
      
      return tokens;
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string, deviceInfo: DeviceInfo): Promise<void> {
    try {
      // Remove refresh token from database
      const deletedToken = await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });

      if (deletedToken.count > 0) {
        // Get user info for logging
        const payload = jwt.decode(refreshToken) as RefreshTokenPayload;
        
        // Log security event
        await this.logSecurityEvent({
          userId: payload?.userId,
          type: 'logout',
          ipAddress: deviceInfo.ipAddress,
          userAgent: deviceInfo.userAgent,
          details: { success: true }
        });

        logger.info('User logged out successfully', { userId: payload?.userId });
      }
    } catch (error) {
      logger.error('Logout failed', { error });
      throw error;
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        // Don't reveal if user exists
        logger.warn('Password reset requested for non-existent user', { email });
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Store reset token
      await prisma.passwordResetToken.create({
        data: {
          token: hashedToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + authConfig.verification.emailTokenExpiry)
        }
      });

      // Send reset email (async)
      this.sendPasswordResetEmail(user.email, resetToken).catch(error => {
        logger.error('Failed to send password reset email', { error, userId: user.id });
      });

      logger.info('Password reset token generated', { userId: user.id });
    } catch (error) {
      logger.error('Forgot password failed', { error, email });
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Validate password
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new AppError('Password does not meet requirements', 400, passwordValidation.errors);
      }

      // Hash the token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find valid reset token
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token: hashedToken,
          used: false,
          expiresAt: { gt: new Date() }
        },
        include: { user: true }
      });

      if (!resetToken) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, authConfig.bcrypt.saltRounds);

      // Update password and mark token as used
      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetToken.userId },
          data: { password: hashedPassword }
        }),
        prisma.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { used: true }
        }),
        // Invalidate all refresh tokens for security
        prisma.refreshToken.deleteMany({
          where: { userId: resetToken.userId }
        })
      ]);

      logger.info('Password reset successfully', { userId: resetToken.userId });
    } catch (error) {
      logger.error('Password reset failed', { error });
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Validate new password
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new AppError('New password does not meet requirements', 400, passwordValidation.errors);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, authConfig.bcrypt.saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      logger.info('Password changed successfully', { userId });
    } catch (error) {
      logger.error('Password change failed', { error, userId });
      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      // Hash the token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find valid verification token
      const verificationToken = await prisma.emailVerificationToken.findFirst({
        where: {
          token: hashedToken,
          used: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!verificationToken) {
        throw new AppError('Invalid or expired verification token', 400);
      }

      // Update user and mark token as used
      await prisma.$transaction([
        prisma.user.update({
          where: { id: verificationToken.userId },
          data: { emailVerified: true }
        }),
        prisma.emailVerificationToken.update({
          where: { id: verificationToken.id },
          data: { used: true }
        })
      ]);

      logger.info('Email verified successfully', { userId: verificationToken.userId });
    } catch (error) {
      logger.error('Email verification failed', { error });
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.emailVerified) {
        throw new AppError('Email is already verified', 400);
      }

      // Check rate limiting for resend attempts
      const cacheKey = `resend_verification:${email}`;
      const attempts = await cache.get(cacheKey);
      
      if (attempts && parseInt(attempts) >= authConfig.verification.maxResendAttempts) {
        throw new AppError('Too many resend attempts. Please try again later.', 429);
      }

      // Send verification email
      await this.sendVerificationEmail(user.email, user.id);

      // Update rate limit counter
      await cache.set(cacheKey, (parseInt(attempts || '0') + 1).toString(), authConfig.verification.resendCooldown / 1000);

      logger.info('Verification email resent', { userId: user.id });
    } catch (error) {
      logger.error('Resend verification email failed', { error, email });
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    // Generate access token
    const accessToken = jwt.sign(payload, authConfig.jwt.secret, {
      expiresIn: authConfig.jwt.accessTokenExpiry,
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
      algorithm: authConfig.jwt.algorithm
    });

    // Generate refresh token
    const refreshTokenId = crypto.randomUUID();
    const refreshTokenPayload: RefreshTokenPayload = {
      userId: user.id,
      tokenId: refreshTokenId
    };

    const refreshToken = jwt.sign(refreshTokenPayload, authConfig.jwt.refreshSecret, {
      expiresIn: authConfig.jwt.refreshTokenExpiry,
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
      algorithm: authConfig.jwt.algorithm
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + this.parseExpiry(authConfig.jwt.refreshTokenExpiry));

    await prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(authConfig.jwt.accessTokenExpiry) / 1000,
      tokenType: 'Bearer'
    };
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];
    let score = 0;

    // Length check
    if (password.length < authConfig.password.minLength) {
      errors.push(`Password must be at least ${authConfig.password.minLength} characters long`);
    } else {
      score += 1;
    }

    // Uppercase check
    if (authConfig.password.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
      score += 1;
    }

    // Lowercase check
    if (authConfig.password.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
      score += 1;
    }

    // Number check
    if (authConfig.password.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (/\d/.test(password)) {
      score += 1;
    }

    // Special character check
    if (authConfig.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    }

    // Additional complexity checks
    if (password.length >= 12) score += 1;
    if (/[A-Z].*[A-Z]/.test(password)) score += 1;
    if (/\d.*\d/.test(password)) score += 1;

    const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';

    return {
      isValid: errors.length === 0,
      errors,
      strength,
      score
    };
  }

  /**
   * Check rate limiting for login attempts
   */
  private async checkRateLimit(email: string, ipAddress: string): Promise<void> {
    const emailKey = `rate_limit:email:${email}`;
    const ipKey = `rate_limit:ip:${ipAddress}`;

    const [emailAttempts, ipAttempts] = await Promise.all([
      cache.get(emailKey),
      cache.get(ipKey)
    ]);

    if (emailAttempts && parseInt(emailAttempts) >= authConfig.rateLimit.maxAttempts) {
      throw new AppError('Too many login attempts for this email. Please try again later.', 429);
    }

    if (ipAttempts && parseInt(ipAttempts) >= authConfig.rateLimit.maxAttempts * 3) {
      throw new AppError('Too many login attempts from this IP. Please try again later.', 429);
    }
  }

  /**
   * Record failed login attempt
   */
  private async recordFailedLogin(email: string, deviceInfo: DeviceInfo, reason: string): Promise<void> {
    const emailKey = `rate_limit:email:${email}`;
    const ipKey = `rate_limit:ip:${deviceInfo.ipAddress}`;

    await Promise.all([
      cache.incr(emailKey),
      cache.incr(ipKey),
      cache.expire(emailKey, authConfig.rateLimit.windowMs / 1000),
      cache.expire(ipKey, authConfig.rateLimit.windowMs / 1000)
    ]);

    // Log security event
    await this.logSecurityEvent({
      type: 'login',
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      details: { success: false, email, reason }
    });
  }

  /**
   * Clear rate limit after successful login
   */
  private async clearRateLimit(email: string, ipAddress: string): Promise<void> {
    await Promise.all([
      cache.del(`rate_limit:email:${email}`),
      cache.del(`rate_limit:ip:${ipAddress}`)
    ]);
  }

  /**
   * Log security events
   */
  private async logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    const securityEvent = {
      ...event,
      timestamp: new Date()
    };

    // Store in cache for real-time monitoring
    const eventKey = `security_event:${Date.now()}:${crypto.randomUUID()}`;
    await cache.set(eventKey, JSON.stringify(securityEvent), 3600); // 1 hour

    // Log to file
    logger.security('Security event', securityEvent);
  }

  /**
   * Transform User to AuthUser
   */
  private transformToAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    };
  }

  /**
   * Parse JWT expiry string to milliseconds
   */
  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return parseInt(expiry) * 1000;
    }
  }

  /**
   * Send verification email
   */
  private async sendVerificationEmail(email: string, userId: string): Promise<void> {
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Store verification token
    await prisma.emailVerificationToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt: new Date(Date.now() + authConfig.verification.emailTokenExpiry)
      }
    });

    // Send verification email using notification service
    try {
      const { notificationService } = await import('@/services/notificationService');
      
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
      
      await notificationService.sendNotification({
        userId,
        type: 'EMAIL_VERIFICATION',
        channels: ['EMAIL'],
        data: {
          email,
          verificationUrl,
          verificationToken
        },
        metadata: {
          priority: 'high',
          category: 'authentication'
        }
      });

      logger.info('Verification email sent successfully', { email, userId });
    } catch (error) {
      logger.error('Failed to send verification email', { error, email, userId });
      // Don't throw error to prevent registration failure
    }
  }

  /**
   * Send password reset email (placeholder - implement with your email service)
   */
  private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // TODO: Implement email sending logic
    logger.info('Password reset email would be sent', { email, token });
  }
}

export const authService = new AuthService();