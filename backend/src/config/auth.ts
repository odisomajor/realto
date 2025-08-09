import { Algorithm } from 'jsonwebtoken';

export interface AuthConfig {
  jwt: {
    secret: string;
    refreshSecret: string;
    algorithm: Algorithm;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    issuer: string;
    audience: string;
  };
  bcrypt: {
    saltRounds: number;
  };
  session: {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  rateLimit: {
    windowMs: number;
    maxAttempts: number;
    blockDuration: number;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  verification: {
    emailTokenExpiry: number;
    phoneTokenExpiry: number;
    maxResendAttempts: number;
    resendCooldown: number;
  };
}

const authConfig: AuthConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    algorithm: 'HS256',
    accessTokenExpiry: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'xillix-real-estate',
    audience: process.env.JWT_AUDIENCE || 'xillix-users',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
  },
  session: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxAttempts: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5'),
    blockDuration: parseInt(process.env.RATE_LIMIT_BLOCK_DURATION || '3600000'), // 1 hour
  },
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS !== 'false',
  },
  verification: {
    emailTokenExpiry: parseInt(process.env.EMAIL_TOKEN_EXPIRY || '3600000'), // 1 hour
    phoneTokenExpiry: parseInt(process.env.PHONE_TOKEN_EXPIRY || '300000'), // 5 minutes
    maxResendAttempts: parseInt(process.env.MAX_RESEND_ATTEMPTS || '3'),
    resendCooldown: parseInt(process.env.RESEND_COOLDOWN || '60000'), // 1 minute
  },
};

export default authConfig;