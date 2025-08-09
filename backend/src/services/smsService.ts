import twilio from 'twilio';
import { logger } from '../utils/logger';
import handlebars from 'handlebars';

export interface SMSTemplate {
  content: string;
}

export interface SMSOptions {
  to: string;
  message: string;
  template?: string;
  templateData?: Record<string, any>;
}

export class SMSService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string | null = null;
  private templates: Map<string, SMSTemplate> = new Map();
  private isConfigured = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER || null;

      if (!accountSid || !authToken || !this.fromNumber) {
        logger.warn('SMS service: Twilio configuration incomplete');
        return;
      }

      this.client = twilio(accountSid, authToken);
      this.isConfigured = true;
      logger.info('SMS service: Successfully configured');

      // Load SMS templates
      this.loadTemplates();
      
    } catch (error) {
      logger.error('SMS service initialization failed:', error);
      this.isConfigured = false;
    }
  }

  private loadTemplates() {
    // Define SMS templates (shorter due to character limits)
    const defaultTemplates: Record<string, string> = {
      'notification-basic': '{{title}}: {{message}}',
      
      'property-inquiry': 'New inquiry for {{propertyTitle}} from {{inquirerName}}. Check your dashboard for details.',
      
      'appointment-reminder': 'Reminder: {{appointmentType}} appointment for {{propertyTitle}} on {{appointmentDate}} at {{appointmentTime}}.',
      
      'appointment-confirmed': 'Your {{appointmentType}} appointment for {{propertyTitle}} on {{appointmentDate}} at {{appointmentTime}} has been confirmed.',
      
      'price-change': 'Price update: {{propertyTitle}} is now ${{newPrice}} (was ${{oldPrice}}). View details in your app.',
      
      'new-listing': 'New listing match: {{propertyTitle}} in {{location}} for ${{price}}. View now!',
      
      'system-alert': 'System Alert: {{message}}',
      
      'welcome': 'Welcome to RealEstate Platform! Your account has been created successfully.',
      
      'verification': 'Your verification code is: {{code}}. This code expires in 10 minutes.',
      
      'password-reset': 'Password reset requested. Use code: {{code}} to reset your password.'
    };

    for (const [name, content] of Object.entries(defaultTemplates)) {
      this.templates.set(name, { content });
    }

    logger.info(`SMS templates loaded: ${this.templates.size} templates`);
  }

  async sendSMS(options: SMSOptions): Promise<boolean> {
    if (!this.isConfigured || !this.client || !this.fromNumber) {
      logger.warn('SMS service not configured, skipping SMS send');
      return false;
    }

    try {
      let message = options.message;

      // Use template if specified
      if (options.template && this.templates.has(options.template)) {
        const template = this.templates.get(options.template)!;
        const compiledTemplate = handlebars.compile(template.content);
        message = compiledTemplate(options.templateData || {});
      }

      // Ensure message is within SMS character limits (160 for standard SMS)
      if (message.length > 160) {
        logger.warn(`SMS message truncated from ${message.length} to 160 characters`);
        message = message.substring(0, 157) + '...';
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: this.formatPhoneNumber(options.to),
      });

      logger.info(`SMS sent successfully: ${result.sid}`);
      return true;

    } catch (error) {
      logger.error('Failed to send SMS:', error);
      return false;
    }
  }

  async sendNotificationSMS(
    to: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    return this.sendSMS({
      to,
      template: 'notification-basic',
      templateData: {
        title,
        message,
        ...data,
      },
    });
  }

  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    return this.sendSMS({
      to,
      template: 'verification',
      templateData: { code },
    });
  }

  async sendPasswordResetCode(to: string, code: string): Promise<boolean> {
    return this.sendSMS({
      to,
      template: 'password-reset',
      templateData: { code },
    });
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming US +1)
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return cleaned;
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    if (!this.isConfigured || !this.client) {
      return false;
    }

    try {
      const lookup = await this.client.lookups.v1.phoneNumbers(phoneNumber).fetch();
      return lookup.phoneNumber !== null;
    } catch (error) {
      logger.warn(`Phone number validation failed for ${phoneNumber}:`, error);
      return false;
    }
  }
}

export const smsService = new SMSService();