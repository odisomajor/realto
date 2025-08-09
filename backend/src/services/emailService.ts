import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private templates: Map<string, EmailTemplate> = new Map();
  private isConfigured = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const smtpConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };

      if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
        logger.warn('Email service: SMTP configuration incomplete');
        return;
      }

      this.transporter = nodemailer.createTransport(smtpConfig);
      
      // Verify connection
      await this.transporter.verify();
      this.isConfigured = true;
      logger.info('Email service: Successfully configured and verified');

      // Load email templates
      await this.loadTemplates();
      
    } catch (error) {
      logger.error('Email service initialization failed:', error);
      this.isConfigured = false;
    }
  }

  private async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates/email');
      
      // Create templates directory if it doesn't exist
      try {
        await fs.access(templatesDir);
      } catch {
        await fs.mkdir(templatesDir, { recursive: true });
        await this.createDefaultTemplates(templatesDir);
      }

      const templateFiles = await fs.readdir(templatesDir);
      
      for (const file of templateFiles) {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '');
          const templatePath = path.join(templatesDir, file);
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          
          // Parse template metadata (subject line from comment)
          const subjectMatch = templateContent.match(/{{!-- subject: (.+?) --}}/);
          const subject = subjectMatch ? subjectMatch[1] : `Notification: ${templateName}`;
          
          this.templates.set(templateName, {
            subject,
            html: templateContent,
          });
          
          logger.info(`Email template loaded: ${templateName}`);
        }
      }
    } catch (error) {
      logger.error('Failed to load email templates:', error);
    }
  }

  private async createDefaultTemplates(templatesDir: string) {
    const defaultTemplates = {
      'notification-basic': `{{!-- subject: {{title}} --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{title}}</h1>
        </div>
        <div class="content">
            <p>{{message}}</p>
            {{#if actionUrl}}
            <p><a href="{{actionUrl}}" class="button">{{actionText}}</a></p>
            {{/if}}
            {{#if data}}
            <hr>
            <h3>Details:</h3>
            <ul>
                {{#each data}}
                <li><strong>{{@key}}:</strong> {{this}}</li>
                {{/each}}
            </ul>
            {{/if}}
        </div>
        <div class="footer">
            <p>This is an automated message from RealEstate Platform</p>
            <p>If you have questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`,

      'property-inquiry': `{{!-- subject: New Property Inquiry - {{propertyTitle}} --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Property Inquiry</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .property-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .inquiry-details { background: #f0f9ff; padding: 15px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>New Property Inquiry</h1>
        <p>You have received a new inquiry for your property listing.</p>
        
        <div class="property-card">
            <h2>{{propertyTitle}}</h2>
            <p><strong>Address:</strong> {{propertyAddress}}</p>
            <p><strong>Price:</strong> \${{propertyPrice}}</p>
        </div>
        
        <div class="inquiry-details">
            <h3>Inquiry Details</h3>
            <p><strong>From:</strong> {{inquirerName}} ({{inquirerEmail}})</p>
            <p><strong>Phone:</strong> {{inquirerPhone}}</p>
            <p><strong>Message:</strong></p>
            <p>{{inquiryMessage}}</p>
        </div>
        
        <p><a href="{{dashboardUrl}}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px;">View in Dashboard</a></p>
    </div>
</body>
</html>`,

      'appointment-reminder': `{{!-- subject: Appointment Reminder - {{appointmentDate}} --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Appointment Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .appointment-card { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .time-info { font-size: 18px; font-weight: bold; color: #92400e; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Appointment Reminder</h1>
        
        <div class="appointment-card">
            <div class="time-info">{{appointmentDate}} at {{appointmentTime}}</div>
            <p><strong>Property:</strong> {{propertyTitle}}</p>
            <p><strong>Address:</strong> {{propertyAddress}}</p>
            <p><strong>Type:</strong> {{appointmentType}}</p>
            {{#if meetingLink}}
            <p><strong>Meeting Link:</strong> <a href="{{meetingLink}}">Join Virtual Meeting</a></p>
            {{/if}}
            {{#if notes}}
            <p><strong>Notes:</strong> {{notes}}</p>
            {{/if}}
        </div>
        
        <p>Please arrive 5 minutes early. If you need to reschedule, please contact us as soon as possible.</p>
    </div>
</body>
</html>`
    };

    for (const [name, content] of Object.entries(defaultTemplates)) {
      await fs.writeFile(path.join(templatesDir, `${name}.hbs`), content);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured, skipping email send');
      return false;
    }

    try {
      let { subject, html, text } = options;

      // Use template if specified
      if (options.template && this.templates.has(options.template)) {
        const template = this.templates.get(options.template)!;
        const compiledTemplate = handlebars.compile(template.html);
        const compiledSubject = handlebars.compile(template.subject);
        
        html = compiledTemplate(options.templateData || {});
        subject = compiledSubject(options.templateData || {});
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@realestate.com',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject,
        html,
        text,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully: ${result.messageId}`);
      return true;

    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendNotificationEmail(
    to: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: title, // Add the required subject field
      template: 'notification-basic',
      templateData: {
        title,
        message,
        data,
      },
    });
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}

export const emailService = new EmailService();