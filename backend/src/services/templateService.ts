import Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
  subject?: string; // For email templates
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateData {
  [key: string]: any;
}

export interface CompiledTemplate {
  subject?: string;
  content: string;
}

export class TemplateService {
  private templates: Map<string, NotificationTemplate> = new Map();
  private compiledTemplates: Map<string, Handlebars.TemplateDelegate> = new Map();
  private templatesDir: string;

  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.initializeDefaultTemplates();
    this.loadTemplatesFromDisk();
  }

  private initializeDefaultTemplates() {
    const defaultTemplates: NotificationTemplate[] = [
      // Email Templates
      {
        id: 'welcome-email',
        name: 'Welcome Email',
        type: 'EMAIL',
        subject: 'Welcome to {{appName}}!',
        content: `
          <h1>Welcome {{userName}}!</h1>
          <p>Thank you for joining {{appName}}. We're excited to help you find your dream property.</p>
          <p>Your account has been successfully created with email: {{userEmail}}</p>
          <div style="margin: 20px 0;">
            <a href="{{loginUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Get Started
            </a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The {{appName}} Team</p>
        `,
        variables: ['userName', 'userEmail', 'appName', 'loginUrl'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'inquiry-notification-email',
        name: 'Property Inquiry Notification',
        type: 'EMAIL',
        subject: 'New inquiry for {{propertyTitle}}',
        content: `
          <h2>New Property Inquiry</h2>
          <p>You have received a new inquiry for your property:</p>
          <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3>{{propertyTitle}}</h3>
            <p><strong>From:</strong> {{inquirerName}} ({{inquirerEmail}})</p>
            <p><strong>Phone:</strong> {{inquirerPhone}}</p>
            <p><strong>Message:</strong></p>
            <p>{{inquiryMessage}}</p>
          </div>
          <div style="margin: 20px 0;">
            <a href="{{inquiryUrl}}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Inquiry
            </a>
            <a href="{{responseUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">
              Respond Now
            </a>
          </div>
        `,
        variables: ['propertyTitle', 'inquirerName', 'inquirerEmail', 'inquirerPhone', 'inquiryMessage', 'inquiryUrl', 'responseUrl'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'appointment-confirmation-email',
        name: 'Appointment Confirmation',
        type: 'EMAIL',
        subject: 'Appointment confirmed for {{propertyTitle}}',
        content: `
          <h2>Appointment Confirmed</h2>
          <p>Your appointment has been confirmed for the following property:</p>
          <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <h3>{{propertyTitle}}</h3>
            <p><strong>Date:</strong> {{appointmentDate}}</p>
            <p><strong>Time:</strong> {{appointmentTime}}</p>
            <p><strong>Address:</strong> {{propertyAddress}}</p>
            <p><strong>Agent:</strong> {{agentName}} ({{agentPhone}})</p>
          </div>
          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Please arrive 5 minutes early</li>
            <li>Bring a valid ID</li>
            <li>Contact the agent if you need to reschedule</li>
          </ul>
          <div style="margin: 20px 0;">
            <a href="{{appointmentUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Details
            </a>
            <a href="{{rescheduleUrl}}" style="background: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">
              Reschedule
            </a>
          </div>
        `,
        variables: ['propertyTitle', 'appointmentDate', 'appointmentTime', 'propertyAddress', 'agentName', 'agentPhone', 'appointmentUrl', 'rescheduleUrl'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // SMS Templates
      {
        id: 'inquiry-notification-sms',
        name: 'Property Inquiry SMS',
        type: 'SMS',
        content: 'New inquiry for {{propertyTitle}} from {{inquirerName}}. View details: {{inquiryUrl}}',
        variables: ['propertyTitle', 'inquirerName', 'inquiryUrl'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'appointment-reminder-sms',
        name: 'Appointment Reminder SMS',
        type: 'SMS',
        content: 'Reminder: Your appointment for {{propertyTitle}} is tomorrow at {{appointmentTime}}. Agent: {{agentName}} {{agentPhone}}',
        variables: ['propertyTitle', 'appointmentTime', 'agentName', 'agentPhone'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'price-alert-sms',
        name: 'Price Change Alert SMS',
        type: 'SMS',
        content: 'Price Alert: {{propertyTitle}} price {{changeType}} to ${{newPrice}}. View: {{propertyUrl}}',
        variables: ['propertyTitle', 'changeType', 'newPrice', 'propertyUrl'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Push Notification Templates
      {
        id: 'general-push',
        name: 'General Push Notification',
        type: 'PUSH',
        subject: '{{title}}',
        content: '{{message}}',
        variables: ['title', 'message'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private async loadTemplatesFromDisk() {
    try {
      // Create templates directory if it doesn't exist
      await fs.mkdir(this.templatesDir, { recursive: true });

      // Load custom templates from files (if any)
      const files = await fs.readdir(this.templatesDir);
      const templateFiles = files.filter(file => file.endsWith('.json'));

      for (const file of templateFiles) {
        try {
          const filePath = path.join(this.templatesDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const template: NotificationTemplate = JSON.parse(content);
          this.templates.set(template.id, template);
          logger.info(`Loaded template: ${template.name}`);
        } catch (error) {
          logger.error(`Failed to load template file ${file}:`, error);
        }
      }
    } catch (error) {
      logger.error('Failed to load templates from disk:', error);
    }
  }

  async compileTemplate(templateId: string, data: TemplateData): Promise<CompiledTemplate | null> {
    try {
      const template = this.templates.get(templateId);
      if (!template || !template.isActive) {
        logger.warn(`Template not found or inactive: ${templateId}`);
        return null;
      }

      // Compile content template
      let contentTemplate = this.compiledTemplates.get(`${templateId}-content`);
      if (!contentTemplate) {
        contentTemplate = Handlebars.compile(template.content);
        this.compiledTemplates.set(`${templateId}-content`, contentTemplate);
      }

      const compiledContent = contentTemplate(data);
      let compiledSubject: string | undefined;

      // Compile subject template if exists
      if (template.subject) {
        let subjectTemplate = this.compiledTemplates.get(`${templateId}-subject`);
        if (!subjectTemplate) {
          subjectTemplate = Handlebars.compile(template.subject);
          this.compiledTemplates.set(`${templateId}-subject`, subjectTemplate);
        }
        compiledSubject = subjectTemplate(data);
      }

      return {
        subject: compiledSubject,
        content: compiledContent,
      };

    } catch (error) {
      logger.error(`Failed to compile template ${templateId}:`, error);
      return null;
    }
  }

  getTemplate(templateId: string): NotificationTemplate | null {
    return this.templates.get(templateId) || null;
  }

  getTemplatesByType(type: 'EMAIL' | 'SMS' | 'PUSH'): NotificationTemplate[] {
    return Array.from(this.templates.values()).filter(
      template => template.type === type && template.isActive
    );
  }

  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  async saveTemplate(template: NotificationTemplate): Promise<boolean> {
    try {
      this.templates.set(template.id, template);
      
      // Save to disk
      const filePath = path.join(this.templatesDir, `${template.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(template, null, 2));
      
      // Clear compiled template cache
      this.compiledTemplates.delete(`${template.id}-content`);
      this.compiledTemplates.delete(`${template.id}-subject`);
      
      logger.info(`Template saved: ${template.name}`);
      return true;

    } catch (error) {
      logger.error(`Failed to save template ${template.id}:`, error);
      return false;
    }
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      this.templates.delete(templateId);
      
      // Remove from disk
      const filePath = path.join(this.templatesDir, `${templateId}.json`);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // File might not exist, which is okay
      }
      
      // Clear compiled template cache
      this.compiledTemplates.delete(`${templateId}-content`);
      this.compiledTemplates.delete(`${templateId}-subject`);
      
      logger.info(`Template deleted: ${templateId}`);
      return true;

    } catch (error) {
      logger.error(`Failed to delete template ${templateId}:`, error);
      return false;
    }
  }

  validateTemplateData(templateId: string, data: TemplateData): { isValid: boolean; missingVariables: string[] } {
    const template = this.templates.get(templateId);
    if (!template) {
      return { isValid: false, missingVariables: [] };
    }

    const missingVariables = template.variables.filter(variable => 
      data[variable] === undefined || data[variable] === null
    );

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
    };
  }

  // Helper methods for common template scenarios
  async compileWelcomeEmail(userData: {
    userName: string;
    userEmail: string;
    appName?: string;
    loginUrl?: string;
  }): Promise<CompiledTemplate | null> {
    return this.compileTemplate('welcome-email', {
      appName: 'RealEstate Pro',
      loginUrl: 'https://app.realestate.com/login',
      ...userData,
    });
  }

  async compileInquiryNotification(inquiryData: {
    propertyTitle: string;
    inquirerName: string;
    inquirerEmail: string;
    inquirerPhone?: string;
    inquiryMessage: string;
    inquiryUrl?: string;
    responseUrl?: string;
  }): Promise<{ email: CompiledTemplate | null; sms: CompiledTemplate | null }> {
    const emailTemplate = await this.compileTemplate('inquiry-notification-email', {
      inquiryUrl: '/dashboard/inquiries',
      responseUrl: '/dashboard/inquiries/respond',
      ...inquiryData,
    });

    const smsTemplate = await this.compileTemplate('inquiry-notification-sms', {
      inquiryUrl: '/dashboard/inquiries',
      ...inquiryData,
    });

    return { email: emailTemplate, sms: smsTemplate };
  }

  async compileAppointmentConfirmation(appointmentData: {
    propertyTitle: string;
    appointmentDate: string;
    appointmentTime: string;
    propertyAddress: string;
    agentName: string;
    agentPhone: string;
    appointmentUrl?: string;
    rescheduleUrl?: string;
  }): Promise<CompiledTemplate | null> {
    return this.compileTemplate('appointment-confirmation-email', {
      appointmentUrl: '/dashboard/appointments',
      rescheduleUrl: '/dashboard/appointments/reschedule',
      ...appointmentData,
    });
  }
}

export const templateService = new TemplateService();