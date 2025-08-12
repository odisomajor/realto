// Define enums locally since SQLite doesn't support enums
export enum PropertyType {
  HOUSE = 'HOUSE',
  APARTMENT = 'APARTMENT',
  CONDO = 'CONDO',
  TOWNHOUSE = 'TOWNHOUSE',
  VILLA = 'VILLA',
  LAND = 'LAND',
  COMMERCIAL = 'COMMERCIAL',
  OFFICE = 'OFFICE',
  RETAIL = 'RETAIL',
  WAREHOUSE = 'WAREHOUSE',
  INDUSTRIAL = 'INDUSTRIAL'
}

export enum ListingType {
  SALE = 'SALE',
  RENT = 'RENT',
  LEASE = 'LEASE'
}

export enum NotificationType {
  WELCOME = 'WELCOME',
  PROPERTY_INQUIRY = 'PROPERTY_INQUIRY',
  APPOINTMENT_SCHEDULED = 'APPOINTMENT_SCHEDULED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  PROPERTY_APPROVED = 'PROPERTY_APPROVED',
  PROPERTY_REJECTED = 'PROPERTY_REJECTED',
  ACCOUNT_VERIFIED = 'ACCOUNT_VERIFIED',
  NEW_REVIEW = 'NEW_REVIEW',
  PRICE_CHANGE = 'PRICE_CHANGE',
  FAVORITE_PROPERTY_UPDATE = 'FAVORITE_PROPERTY_UPDATE',
  ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  SUBSCRIPTION_EXPIRY = 'SUBSCRIPTION_EXPIRY',
  NEW_MESSAGE = 'NEW_MESSAGE',
  PROPERTY_MATCH = 'PROPERTY_MATCH'
}

// Define custom enums that are not in Prisma schema
export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE'
}

export enum PropertyCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR'
}

export enum InquiryType {
  GENERAL = 'GENERAL',
  VIEWING = 'VIEWING',
  OFFER = 'OFFER'
}

export enum InquiryStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  CLOSED = 'CLOSED'
}

export enum AppointmentType {
  VIEWING = 'VIEWING',
  CONSULTATION = 'CONSULTATION',
  INSPECTION = 'INSPECTION'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface PropertySearchFilters {
  // Location
  city?: string;
  county?: string;
  radius?: number; // in miles
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Property Type & Listing
  propertyType?: PropertyType[];
  listingType?: ListingType;
  status?: PropertyStatus[];

  // Price Range
  minPrice?: number;
  maxPrice?: number;
  pricePerSqft?: {
    min?: number;
    max?: number;
  };

  // Property specifications
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minSquareFootage?: number;
  maxSquareFootage?: number;
  minLotSize?: number;
  maxLotSize?: number;
  yearBuiltFrom?: number;
  yearBuiltTo?: number;

  // Amenities & Features
  features?: string[];
  amenities?: string[];
  parking?: boolean;
  garage?: boolean;
  pool?: boolean;
  fireplace?: boolean;
  basement?: boolean;
  balcony?: boolean;

  // Other Filters
  condition?: PropertyCondition[];
  renovated?: boolean;
  featured?: boolean;
  hasVirtualTour?: boolean;
  hasVideo?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;

  // Agent/Agency
  agentId?: string;
  agencyId?: string;

  // Date Filters
  listedAfter?: Date;
  listedBefore?: Date;
  updatedAfter?: Date;
}

export interface PropertySearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'date' | 'size' | 'relevance' | 'distance';
  sortOrder?: 'asc' | 'desc';
  includeImages?: boolean;
  includeAgent?: boolean;
  includeAgency?: boolean;
  includeReviews?: boolean;
  includeInactive?: boolean;
}

export interface PropertySearchResult {
  properties: PropertySummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  filters: PropertySearchFilters;
  aggregations?: {
    priceRange: { min: number; max: number };
    avgPrice: number;
    propertyTypes: Record<PropertyType, number>;
    cities: Record<string, number>;
    neighborhoods: Record<string, number>;
  };
}

export interface PropertySummary {
  id: string;
  title: string;
  slug: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  pricePerSqft?: number;
  currency: string;
  
  // Location
  address: string;
  city: string;
  county: string;
  coordinates: {
    lat: number;
    lng: number;
  };

  // Basic Info
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;

  // Media
  mainImage?: string;
  imageCount: number;
  hasVirtualTour: boolean;
  hasVideo: boolean;

  // Agent Info
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
  };

  // Stats
  viewCount: number;
  favoriteCount: number;
  inquiryCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface PropertyDetails extends PropertySummary {
  description: string;
  features: string[];
  amenities: string[];
  appliances: string[];
  utilities: string[];
  heating?: string;
  cooling?: string;
  flooring: string[];
  condition?: PropertyCondition;
  renovated: boolean;
  renovationYear?: number;
  
  // Extended Property Info
  lotSize?: number;
  stories?: number;
  garage?: number;
  parking?: string;
  halfBathrooms?: number;
  
  // Media
  images: PropertyImageInfo[];
  videos: PropertyVideoInfo[];
  virtualTour?: string;
  floorPlan?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  
  // Agency Info
  agency?: {
    id: string;
    name: string;
    logo?: string;
    phone: string;
    email: string;
  };
  
  // Price History
  priceHistory?: PriceHistoryEntry[];
  
  // Similar Properties
  similarProperties?: PropertySummary[];
  
  // Reviews
  reviews?: PropertyReview[];
  averageRating?: number;
  reviewCount: number;
}

export interface PropertyImageInfo {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  order: number;
  isMain: boolean;
}

export interface PropertyVideoInfo {
  id: string;
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  order: number;
}

export interface PriceHistoryEntry {
  price: number;
  date: Date;
  changeType: 'increase' | 'decrease' | 'initial';
  changeAmount?: number;
  changePercentage?: number;
}

export interface PropertyReview {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: Date;
  approved: boolean;
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  currency?: string;
  
  // Location
  address: string;
  city: string;
  county: string;
  latitude: number;
  longitude: number;
  
  // Property Details
  bedrooms?: number;
  bathrooms?: number;
  halfBathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  stories?: number;
  garage?: number;
  parking?: string;
  
  // Features
  features?: string[];
  amenities?: string[];
  appliances?: string[];
  utilities?: string[];
  heating?: string;
  cooling?: string;
  flooring?: string[];
  condition?: PropertyCondition;
  renovated?: boolean;
  renovationYear?: number;
  
  // Media URLs
  images?: string[];
  videos?: string[];
  virtualTour?: string;
  floorPlan?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  // Agent/Agency
  agentId?: string;
  agencyId?: string;
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  status?: PropertyStatus;
  featured?: boolean;
  priority?: number;
}

// Aliases for backward compatibility
export type PropertyCreateRequest = CreatePropertyRequest;
export type PropertyUpdateRequest = UpdatePropertyRequest;

export interface PropertyInquiry {
  id: string;
  type: InquiryType;
  status: InquiryStatus;
  subject?: string;
  message: string;
  
  // Contact Info
  name?: string;
  email?: string;
  phone?: string;
  
  // Inquiry Details
  preferredContact?: string;
  timeframe?: string;
  financing?: string;
  additionalInfo?: Record<string, any>;
  
  // User Info
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  
  // Property Info
  property: {
    id: string;
    title: string;
    address: string;
    price: number;
  };
  
  // Response
  response?: string;
  respondedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInquiryRequest {
  propertyId: string;
  type: InquiryType;
  subject?: string;
  message: string;
  name?: string;
  email?: string;
  phone?: string;
  preferredContact?: string;
  timeframe?: string;
  financing?: string;
  additionalInfo?: Record<string, any>;
}

export interface PropertyAppointment {
  id: string;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: Date;
  duration: number;
  timezone?: string;
  notes?: string;
  location?: string;
  meetingLink?: string;
  
  // User Info
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  
  // Property Info
  property?: {
    id: string;
    title: string;
    address: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

export interface CreateAppointmentRequest {
  propertyId?: string;
  type: AppointmentType;
  scheduledAt: Date;
  duration?: number;
  timezone?: string;
  notes?: string;
  location?: string;
}

export interface PropertyAnalytics {
  propertyId: string;
  views: {
    total: number;
    unique: number;
    thisWeek: number;
    thisMonth: number;
    trend: 'up' | 'down' | 'stable';
  };
  inquiries: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    conversionRate: number;
  };
  favorites: {
    total: number;
    thisWeek: number;
    thisMonth: number;
  };
  performance: {
    daysOnMarket: number;
    priceChanges: number;
    averageViewTime: number;
    bounceRate: number;
  };
  demographics: {
    topCities: Record<string, number>;
    ageGroups: Record<string, number>;
    deviceTypes: Record<string, number>;
  };
}

export interface MarketAnalytics {
  area: string;
  timeframe: string;
  averagePrice: number;
  medianPrice: number;
  pricePerSqft: number;
  totalListings: number;
  newListings: number;
  soldProperties: number;
  averageDaysOnMarket: number;
  priceChange: {
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  inventory: {
    total: number;
    monthsOfSupply: number;
    absorption: number;
  };
  propertyTypes: Record<PropertyType, {
    count: number;
    averagePrice: number;
    averageDaysOnMarket: number;
  }>;
}