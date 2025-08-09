# Authentication Flow - Kenya Real Estate Portal

## Overview

This document outlines the comprehensive authentication system for the Kenya
Real Estate Portal, including user registration flows, Two-Factor Authentication
(2FA), and security measures.

## User Types & Registration Requirements

### 1. Publishers (Property Listers)

Publishers are users who want to list properties on the platform.

**Registration Requirements:**

- Full name (mandatory)
- Valid email address
- Phone number (for SMS verification)
- Password (minimum 8 characters, mixed case, numbers, symbols)
- Two-Factor Authentication setup (mandatory)

**Registration Flow:**

1. Publisher clicks "List Property" or "Become a Publisher"
2. Fill registration form with required information
3. Email verification (click link sent to email)
4. SMS verification (enter code sent to phone)
5. 2FA setup (TOTP app or SMS-based)
6. Account activated and can start listing properties

### 2. General Users (Property Browsers/Buyers)

General users can browse properties but must register after viewing 3
properties.

**Browsing Behavior:**

- Anonymous users can browse up to 3 properties
- Property view counter tracked via session/cookies
- After 3rd property view, registration modal appears
- Cannot view more properties without registration

**Registration Requirements:**

- Full name (mandatory)
- Valid email address
- Phone number (for SMS verification)
- Password (minimum 8 characters, mixed case, numbers, symbols)
- Two-Factor Authentication setup (mandatory)

**Registration Flow:**

1. User views 3rd property → Registration modal appears
2. Fill registration form with required information
3. Email verification (click link sent to email)
4. SMS verification (enter code sent to phone)
5. 2FA setup (TOTP app or SMS-based)
6. Account activated and can continue browsing unlimited properties

## Two-Factor Authentication (2FA) Implementation

### 2FA Methods Supported

#### 1. TOTP (Time-based One-Time Password) - Recommended

- Uses authenticator apps like Google Authenticator, Authy, Microsoft
  Authenticator
- Generates QR code during setup
- 6-digit codes that refresh every 30 seconds
- Works offline once set up

#### 2. SMS-based 2FA - Backup Option

- Sends 6-digit code via SMS
- Used as backup when TOTP is unavailable
- Rate-limited to prevent abuse

### 2FA Setup Process

1. **Initial Setup (During Registration):**

   ```
   User Registration → Email Verification → SMS Verification → 2FA Setup → Account Active
   ```

2. **TOTP Setup Steps:**
   - Display QR code containing secret key
   - User scans QR code with authenticator app
   - User enters verification code from app
   - System validates code and saves 2FA secret
   - Generate backup codes (10 single-use codes)

3. **SMS 2FA Setup Steps:**
   - Verify phone number is valid
   - Send test SMS code
   - User enters code to confirm
   - SMS 2FA enabled as backup method

### 2FA Login Process

1. **Standard Login:**

   ```
   Email/Password → 2FA Code → Dashboard Access
   ```

2. **Login Flow:**
   - User enters email and password
   - System validates credentials
   - Prompt for 2FA code (TOTP preferred, SMS as fallback)
   - User enters 6-digit code
   - System validates code
   - Generate JWT token and grant access

## Database Schema for Authentication

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('publisher', 'buyer', 'agent', 'admin') NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_fa_enabled BOOLEAN DEFAULT FALSE,
    two_fa_secret VARCHAR(255), -- TOTP secret
    backup_codes TEXT[], -- Array of backup codes
    account_status ENUM('pending', 'active', 'suspended') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Browsing Sessions Table

```sql
CREATE TABLE browsing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    properties_viewed INTEGER DEFAULT 0,
    registration_prompted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);
```

### Two-Factor Auth Attempts Table

```sql
CREATE TABLE two_fa_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    attempt_type ENUM('totp', 'sms') NOT NULL,
    code_sent VARCHAR(10), -- For SMS codes
    attempts_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Measures

### Rate Limiting

- **Login Attempts:** 5 attempts per 15 minutes per IP
- **2FA Attempts:** 3 attempts per 5 minutes per user
- **SMS Codes:** 3 SMS per hour per phone number
- **Registration:** 3 registrations per hour per IP

### Session Management

- **JWT Tokens:** 24-hour expiration for access tokens
- **Refresh Tokens:** 30-day expiration, stored in Redis
- **Session Invalidation:** On password change, 2FA disable, or suspicious
  activity

### Password Security

- **Minimum Requirements:** 8 characters, uppercase, lowercase, number, symbol
- **Hashing:** bcrypt with salt rounds of 12
- **Password Reset:** Requires email verification + 2FA code

### Account Security Features

- **Account Lockout:** After 5 failed login attempts (30-minute lockout)
- **Suspicious Activity Detection:** Login from new device/location
- **Email Notifications:** For all security events (login, password change, 2FA
  changes)

## API Endpoints

### Authentication Endpoints

```
POST /api/auth/register/publisher     # Publisher registration
POST /api/auth/register/user          # General user registration
POST /api/auth/login                  # User login
POST /api/auth/logout                 # User logout
POST /api/auth/refresh-token          # Refresh JWT token
POST /api/auth/forgot-password        # Password reset request
POST /api/auth/reset-password         # Password reset confirmation
```

### 2FA Endpoints

```
POST /api/auth/2fa/setup-totp         # Setup TOTP 2FA
POST /api/auth/2fa/verify-totp        # Verify TOTP setup
POST /api/auth/2fa/setup-sms          # Setup SMS 2FA
POST /api/auth/2fa/send-sms           # Send SMS code
POST /api/auth/2fa/verify             # Verify 2FA code
POST /api/auth/2fa/disable            # Disable 2FA (requires current 2FA)
GET  /api/auth/2fa/backup-codes       # Generate new backup codes
```

### Verification Endpoints

```
POST /api/auth/verify-email           # Email verification
POST /api/auth/verify-phone           # Phone verification
POST /api/auth/resend-verification    # Resend verification codes
```

### Browsing Session Endpoints

```
GET  /api/browsing/session-status     # Check current browsing session
POST /api/browsing/track-view         # Track property view
GET  /api/browsing/registration-required # Check if registration required
```

## Frontend Implementation

### Registration Components

- `PublisherRegistration.jsx` - Publisher registration form
- `UserRegistration.jsx` - General user registration form
- `EmailVerification.jsx` - Email verification component
- `PhoneVerification.jsx` - SMS verification component
- `TwoFactorSetup.jsx` - 2FA setup component

### Authentication Components

- `Login.jsx` - Login form with 2FA
- `TwoFactorPrompt.jsx` - 2FA code input
- `ForgotPassword.jsx` - Password reset form
- `BrowsingTracker.jsx` - Track property views and trigger registration

### Security Features

- Auto-logout on token expiration
- Secure token storage (httpOnly cookies for refresh tokens)
- CSRF protection
- Input validation and sanitization

## Mobile App Authentication

### Android Implementation

- Biometric authentication support (fingerprint/face)
- Secure storage for tokens using Android Keystore
- Push notifications for security events
- Offline 2FA support with cached TOTP codes

## Compliance & Privacy

### Data Protection

- GDPR-compliant data handling
- User consent for data processing
- Right to data deletion
- Data encryption at rest and in transit

### Audit Logging

- All authentication events logged
- Failed login attempts tracked
- 2FA setup/disable events recorded
- Suspicious activity alerts

This authentication system ensures robust security while maintaining user
experience, specifically tailored for the Kenyan real estate market with
mandatory 2FA and comprehensive user verification.
