// Notification system types and interfaces

export enum NotificationType {
  PROPERTY_INQUIRY = 'PROPERTY_INQUIRY',
  APPOINTMENT_SCHEDULED = 'APPOINTMENT_SCHEDULED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  PROPERTY_APPROVED = 'PROPERTY_APPROVED',
  PROPERTY_REJECTED = 'PROPERTY_REJECTED',
  PROPERTY_EXPIRED = 'PROPERTY_EXPIRED',
  NEW_REVIEW = 'NEW_REVIEW',
  REVIEW_RESPONSE = 'REVIEW_RESPONSE',
  PRICE_CHANGE = 'PRICE_CHANGE',
  PRICE_DROP_ALERT = 'PRICE_DROP_ALERT',
  FAVORITE_PROPERTY_UPDATE = 'FAVORITE_PROPERTY_UPDATE',
  SAVED_SEARCH_MATCH = 'SAVED_SEARCH_MATCH',
  ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',
  ACCOUNT_VERIFIED = 'ACCOUNT_VERIFIED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  EMAIL_CHANGED = 'EMAIL_CHANGED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  WELCOME = 'WELCOME',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUBSCRIPTION_EXPIRY = 'SUBSCRIPTION_EXPIRY',
  SUBSCRIPTION_RENEWED = 'SUBSCRIPTION_RENEWED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  MESSAGE_REPLY = 'MESSAGE_REPLY',
  PROPERTY_MATCH = 'PROPERTY_MATCH',
  MARKET_REPORT = 'MARKET_REPORT',
  NEWSLETTER = 'NEWSLETTER',
  PROMOTION = 'PROMOTION',
  SECURITY_ALERT = 'SECURITY_ALERT',
  LOGIN_ALERT = 'LOGIN_ALERT',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_APPROVED = 'DOCUMENT_APPROVED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  LISTING_VIEWS_MILESTONE = 'LISTING_VIEWS_MILESTONE',
  AGENT_ASSIGNMENT = 'AGENT_ASSIGNMENT',
  AGENCY_INVITATION = 'AGENCY_INVITATION',
  TEAM_INVITATION = 'TEAM_INVITATION',
  COMMISSION_EARNED = 'COMMISSION_EARNED',
  LEAD_ASSIGNED = 'LEAD_ASSIGNED',
  OPEN_HOUSE_REMINDER = 'OPEN_HOUSE_REMINDER',
  VIRTUAL_TOUR_SCHEDULED = 'VIRTUAL_TOUR_SCHEDULED'
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
  WEBHOOK = 'WEBHOOK',
  SLACK = 'SLACK',
  DISCORD = 'DISCORD'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface NotificationData {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  scheduledAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  tags?: string[];
  category?: string;
  actionUrl?: string;
  imageUrl?: string;
  sound?: string;
  badge?: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  template: string;
  variables: string[];
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  description?: string;
  previewData?: Record<string, any>;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  webhook: boolean;
  types: Partial<Record<NotificationType, {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    webhook: boolean;
  }>>;
  categories?: Record<string, {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  }>;
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
    timezone: string;
    days: number[]; // 0-6, Sunday to Saturday
  };
  frequency?: {
    digest: 'NEVER' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    marketing: 'NEVER' | 'WEEKLY' | 'MONTHLY';
    reminders: boolean;
  };
  language: string;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  priority: NotificationPriority;
}

export interface NotificationHistory {
  id: string;
  userId: string;
  notificationId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  metadata?: Record<string, any>;
}

export interface EmailConfig {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
    cid?: string; // Content-ID for inline images
  }>;
  replyTo?: string;
  priority?: 'high' | 'normal' | 'low';
  headers?: Record<string, string>;
}

export interface SMSConfig {
  to: string;
  message: string;
  from?: string;
  mediaUrl?: string[];
  statusCallback?: string;
}

export interface PushConfig {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  image?: string;
  badge?: number;
  sound?: string;
  clickAction?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface WebhookConfig {
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  secret?: string;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
    maxDelay: number;
  };
}

export interface NotificationBatch {
  id: string;
  name?: string;
  notifications: NotificationData[];
  scheduledAt?: Date;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalCount: number;
  sentCount: number;
  failedCount: number;
  metadata?: Record<string, any>;
}

export interface NotificationStats {
  userId?: string;
  period: {
    start: Date;
    end: Date;
  };
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  byChannel: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    failed: number;
  }>;
  byType: Record<NotificationType, {
    sent: number;
    delivered: number;
    failed: number;
  }>;
  deliveryRate: number;
  averageDeliveryTime: number; // in milliseconds
  topFailureReasons: Array<{
    reason: string;
    count: number;
  }>;
}

export interface NotificationQueue {
  id: string;
  name: string;
  priority: number;
  maxConcurrency: number;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
    maxDelay: number;
  };
  deadLetterQueue?: string;
  isActive: boolean;
}

export interface NotificationEvent {
  id: string;
  type: 'SENT' | 'DELIVERED' | 'FAILED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'COMPLAINED';
  notificationId: string;
  userId: string;
  channel: NotificationChannel;
  timestamp: Date;
  data?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description?: string;
  type: NotificationType;
  channels: NotificationChannel[];
  targetAudience: {
    userIds?: string[];
    filters?: {
      roles?: string[];
      locations?: string[];
      properties?: Record<string, any>;
      segments?: string[];
    };
    excludeUserIds?: string[];
  };
  template: {
    subject?: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  };
  schedule: {
    type: 'IMMEDIATE' | 'SCHEDULED' | 'RECURRING';
    scheduledAt?: Date;
    timezone?: string;
    recurring?: {
      frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
      interval: number;
      endDate?: Date;
      maxOccurrences?: number;
    };
  };
  status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  stats?: {
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
    openedCount: number;
    clickedCount: number;
  };
}

export interface NotificationDigest {
  userId: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  period: {
    start: Date;
    end: Date;
  };
  notifications: Array<{
    type: NotificationType;
    count: number;
    latestMessage?: string;
    actionUrl?: string;
  }>;
  summary: {
    totalCount: number;
    unreadCount: number;
    categories: Record<string, number>;
  };
  generatedAt: Date;
  sentAt?: Date;
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface NotificationRule {
  id: string;
  name: string;
  description?: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
  }>;
  actions: Array<{
    type: 'SEND_NOTIFICATION' | 'SUPPRESS_NOTIFICATION' | 'MODIFY_CHANNELS' | 'DELAY_NOTIFICATION';
    config: Record<string, any>;
  }>;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface NotificationAnalytics {
  overview: {
    totalNotifications: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
  };
  trends: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
  channels: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    deliveryRate: number;
    avgDeliveryTime: number;
  }>;
  types: Record<NotificationType, {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    engagementRate: number;
  }>;
  devices: Record<string, number>;
  locations: Record<string, number>;
  timeOfDay: Record<string, number>;
  dayOfWeek: Record<string, number>;
}

// Request/Response types
export interface SendNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  priority?: NotificationPriority;
  scheduledAt?: string; // ISO string
  expiresAt?: string; // ISO string
  actionUrl?: string;
  imageUrl?: string;
  tags?: string[];
  category?: string;
}

export interface SendBulkNotificationRequest {
  notifications: SendNotificationRequest[];
  batchName?: string;
  scheduledAt?: string; // ISO string
}

export interface UpdatePreferencesRequest {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  inApp?: boolean;
  webhook?: boolean;
  types?: Partial<Record<NotificationType, {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    inApp?: boolean;
    webhook?: boolean;
  }>>;
  quietHours?: {
    enabled?: boolean;
    start?: string;
    end?: string;
    timezone?: string;
    days?: number[];
  };
  frequency?: {
    digest?: 'NEVER' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    marketing?: 'NEVER' | 'WEEKLY' | 'MONTHLY';
    reminders?: boolean;
  };
  language?: string;
  webhookUrl?: string;
}

export interface GetNotificationsRequest {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
  category?: string;
  priority?: NotificationPriority;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  tags?: string[];
}

export interface GetNotificationsResponse {
  notifications: InAppNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalCount: number;
    unreadCount: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
  };
}

export interface NotificationStatsRequest {
  userId?: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  groupBy?: 'day' | 'week' | 'month';
  channels?: NotificationChannel[];
  types?: NotificationType[];
}

export interface CreateTemplateRequest {
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  template: string;
  variables: string[];
  description?: string;
  previewData?: Record<string, any>;
}

export interface UpdateTemplateRequest {
  name?: string;
  subject?: string;
  template?: string;
  variables?: string[];
  isActive?: boolean;
  description?: string;
  previewData?: Record<string, any>;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  type: NotificationType;
  channels: NotificationChannel[];
  targetAudience: {
    userIds?: string[];
    filters?: {
      roles?: string[];
      locations?: string[];
      properties?: Record<string, any>;
      segments?: string[];
    };
    excludeUserIds?: string[];
  };
  template: {
    subject?: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  };
  schedule: {
    type: 'IMMEDIATE' | 'SCHEDULED' | 'RECURRING';
    scheduledAt?: string; // ISO string
    timezone?: string;
    recurring?: {
      frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
      interval: number;
      endDate?: string; // ISO string
      maxOccurrences?: number;
    };
  };
}

export interface SubscribePushRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

export interface TestNotificationRequest {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  templateId?: string;
  testData?: Record<string, any>;
}

// Error types
export interface NotificationError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
}

// Webhook payload types
export interface WebhookPayload {
  id: string;
  type: NotificationType;
  userId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string; // ISO string
  signature?: string; // HMAC signature for verification
}

export interface WebhookEvent {
  id: string;
  event: 'notification.sent' | 'notification.delivered' | 'notification.failed' | 'notification.opened' | 'notification.clicked';
  data: {
    notificationId: string;
    userId: string;
    channel: NotificationChannel;
    timestamp: string;
    metadata?: Record<string, any>;
  };
  signature?: string;
}