// User role enum
export enum UserRole {
  USER = 'USER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// User status enum
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

// User Profile Types
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  specialties?: string[];
  languages?: string[];
  licenseNumber?: string;
  yearsOfExperience?: number;
  city?: string;
  state?: string;
  agency?: {
    id: string;
    name: string;
    logo?: string;
    website?: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  stats?: UserStats;
}

// User Update Request
export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  avatar?: string;
  bio?: string;
  specialties?: string[];
  languages?: string[];
  licenseNumber?: string;
  yearsOfExperience?: number;
  city?: string;
  state?: string;
  zipCode?: string;
  address?: string;
  agencyId?: string;
  role?: UserRole;
  status?: UserStatus;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
  notificationSettings?: NotificationSettings;
  preferences?: any;
}

// User Search Filters
export interface UserSearchFilters {
  query?: string;
  role?: UserRole;
  status?: UserStatus;
  agencyId?: string;
  city?: string;
  state?: string;
  specialties?: string[];
  languages?: string[];
  minExperience?: number;
  maxExperience?: number;
  isVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'firstName' | 'lastName' | 'yearsOfExperience' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

// User Search Result
export interface UserSearchResult {
  users: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// User Preferences
export interface UserPreferences {
  searchPreferences: {
    defaultPropertyType?: string;
    defaultListingType?: string;
    priceRange?: {
      min?: number;
      max?: number;
    };
    locationPreferences?: {
      cities?: string[];
      states?: string[];
      radius?: number;
    };
    propertyFeatures?: string[];
    savedSearches?: SavedSearch[];
  };
  notificationSettings: NotificationSettings;
  displaySettings: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    currency: string;
    measurementUnit: 'metric' | 'imperial';
    dateFormat?: string;
    timeFormat?: '12h' | '24h';
  };
  privacySettings: {
    showEmail: boolean;
    showPhone: boolean;
    showLastSeen: boolean;
    allowDirectMessages: boolean;
    profileVisibility?: 'public' | 'agents_only' | 'private';
  };
}

// Notification Settings
export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  newInquiries?: boolean;
  appointmentReminders?: boolean;
  propertyUpdates?: boolean;
  priceChanges?: boolean;
  newReviews?: boolean;
  systemUpdates?: boolean;
}

// Saved Search
export interface SavedSearch {
  id: string;
  name: string;
  filters: any;
  alertFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User Activity
export interface UserActivity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  metadata?: {
    [key: string]: any;
  };
}

export type ActivityType = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'PROFILE_UPDATED'
  | 'PASSWORD_CHANGED'
  | 'EMAIL_VERIFIED'
  | 'PHONE_VERIFIED'
  | 'PROPERTY_CREATED'
  | 'PROPERTY_UPDATED'
  | 'PROPERTY_DELETED'
  | 'INQUIRY_SENT'
  | 'INQUIRY_RECEIVED'
  | 'APPOINTMENT_SCHEDULED'
  | 'APPOINTMENT_CANCELLED'
  | 'REVIEW_SUBMITTED'
  | 'REVIEW_RECEIVED'
  | 'FAVORITE_ADDED'
  | 'FAVORITE_REMOVED'
  | 'SEARCH_SAVED'
  | 'ACCOUNT_CREATED'
  | 'ACCOUNT_DELETED';

// User Statistics
export interface UserStats {
  userId: string;
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  totalInquiries: number;
  totalFavorites: number;
  averageRating: number;
  totalViews: number;
  responseRate: number;
  averageResponseTime: number;
}

// Agent Performance Metrics
export interface AgentPerformance {
  userId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  metrics: {
    propertiesListed: number;
    propertiesSold: number;
    totalSalesValue: number;
    averageDaysOnMarket: number;
    inquiriesReceived: number;
    appointmentsScheduled: number;
    conversionRate: number;
    customerSatisfaction: number;
    responseTime: number; // in hours
  };
  rankings: {
    salesVolume?: number;
    propertiesSold?: number;
    customerSatisfaction?: number;
    responseTime?: number;
  };
}

// User Dashboard Data
export interface UserDashboard {
  user: UserProfile;
  stats: UserStats;
  recentActivity: UserActivity[];
  notifications: UserNotification[];
  quickActions: QuickAction[];
  performance?: AgentPerformance;
}

// User Notification
export interface UserNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  createdAt: Date;
  readAt?: Date;
  metadata?: {
    [key: string]: any;
  };
}

export type NotificationType =
  | 'INQUIRY'
  | 'APPOINTMENT'
  | 'REVIEW'
  | 'PROPERTY_UPDATE'
  | 'PRICE_CHANGE'
  | 'SYSTEM'
  | 'MARKETING'
  | 'REMINDER'
  | 'ALERT';

// Quick Actions
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  color?: string;
  isEnabled: boolean;
}

// User Registration Request
export interface UserRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  agencyId?: string;
  licenseNumber?: string;
  specialties?: string[];
  languages?: string[];
  bio?: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

// User Login Request
export interface UserLoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: {
    userAgent: string;
    ip: string;
    location?: string;
  };
}

// Password Change Request
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Password Reset Request
export interface PasswordResetRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Email Verification Request
export interface EmailVerificationRequest {
  token: string;
}

// Phone Verification Request
export interface PhoneVerificationRequest {
  phone: string;
  code: string;
}

// User Session Info
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    location?: string;
    device?: string;
    browser?: string;
    os?: string;
  };
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
}

// User Device
export interface UserDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'other';
  platform: string;
  browser?: string;
  pushToken?: string;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
}

// API Key
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

// User Verification Status
export interface UserVerificationStatus {
  email: {
    isVerified: boolean;
    verifiedAt?: Date;
    pendingEmail?: string;
  };
  phone: {
    isVerified: boolean;
    verifiedAt?: Date;
    pendingPhone?: string;
  };
  identity: {
    isVerified: boolean;
    verifiedAt?: Date;
    documents?: VerificationDocument[];
  };
  professional: {
    isVerified: boolean;
    verifiedAt?: Date;
    licenseVerified?: boolean;
    agencyVerified?: boolean;
  };
}

// Verification Document
export interface VerificationDocument {
  id: string;
  type: 'license' | 'id' | 'passport' | 'utility_bill' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  url: string;
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

// User Analytics
export interface UserAnalytics {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    profileViews: number;
    contactClicks: number;
    propertyViews: number;
    inquiriesReceived: number;
    appointmentsScheduled: number;
    reviewsReceived: number;
    searchAppearances: number;
    responseRate: number;
    averageResponseTime: number;
  };
  trends: {
    profileViews: TrendData[];
    inquiries: TrendData[];
    appointments: TrendData[];
  };
  topProperties: {
    propertyId: string;
    title: string;
    views: number;
    inquiries: number;
  }[];
}

// Trend Data
export interface TrendData {
  date: Date;
  value: number;
}

// User Export Data
export interface UserExportData {
  profile: UserProfile;
  preferences: UserPreferences;
  activity: UserActivity[];
  properties: any[];
  inquiries: any[];
  appointments: any[];
  reviews: any[];
  favorites: any[];
  notifications: UserNotification[];
  sessions: UserSession[];
  devices: UserDevice[];
}

// Bulk User Operation
export interface BulkUserOperation {
  operation: 'activate' | 'deactivate' | 'delete' | 'update_role' | 'send_notification';
  userIds: string[];
  data?: any;
  reason?: string;
  performedBy: string;
}

// User Import Data
export interface UserImportData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  agencyId?: string;
  licenseNumber?: string;
  specialties?: string[];
  languages?: string[];
  bio?: string;
}

// User Audit Log
export interface UserAuditLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  performedBy: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}