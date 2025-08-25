import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto, SendBulkEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get('SMTP_HOST', 'localhost'),
      port: parseInt(this.configService.get('SMTP_PORT', '25')),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    };

    // Add auth only if credentials provided
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASSWORD');
    if (user && pass) {
      (smtpConfig as any).auth = { user, pass };
    }

    this.transporter = nodemailer.createTransport(smtpConfig);
    this.logger.log(`SMTP configured: ${smtpConfig.host}:${smtpConfig.port}`);
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified');
      return true;
    } catch (error) {
      this.logger.error('SMTP verification failed:', error.message);
      return false;
    }
  }

  async sendEmail(dto: SendEmailDto) {
    const fromEmail = this.configService.get('FROM_EMAIL');
    const fromName = this.configService.get('FROM_NAME');

    const mailOptions = {
      from: dto.fromName 
        ? `"${dto.fromName}" <${fromEmail}>` 
        : `"${fromName}" <${fromEmail}>`,
      to: dto.to,
      subject: dto.subject,
      html: dto.html,
      text: dto.text || this.stripHtml(dto.html),
    };

    try {
      this.logger.log(`Sending email to: ${dto.to}`);
      const result = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`Email sent successfully: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        recipient: dto.to,
        accepted: result.accepted,
        rejected: result.rejected,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${dto.to}:`, error.message);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  async sendBulkEmail(dto: SendBulkEmailDto) {
    const { to, subject, html, text, delay = 1000 } = dto;
    
    this.logger.log(`Starting bulk email to ${to.length} recipients`);
    
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < to.length; i++) {
      const email = to[i];
      
      try {
        const result = await this.sendEmail({
          to: email,
          subject,
          html,
          text,
        });
        
        results.push(result);
        successCount++;
        
        this.logger.log(`Bulk ${i + 1}/${to.length}: ✅ ${email}`);
        
        // Delay between emails
        if (i < to.length - 1 && delay > 0) {
          await this.sleep(delay);
        }
        
      } catch (error) {
        const errorResult = {
          success: false,
          recipient: email,
          error: error.message,
        };
        
        results.push(errorResult);
        failureCount++;
        
        this.logger.error(`Bulk ${i + 1}/${to.length}: ❌ ${email} - ${error.message}`);
      }
    }

    const summary = {
      total: to.length,
      successful: successCount,
      failed: failureCount,
      results,
    };

    this.logger.log(`Bulk complete: ${successCount}✅ ${failureCount}❌`);
    
    return summary;
  }

  async sendTestEmail(to: string) {
    const testContent = {
      to,
      subject: '🧪 Test Email from NestJS + Postfix',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">🧪 Test Email</h1>
          <p>This test email was sent from NestJS application via Postfix SMTP.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Test Details:</h3>
            <ul>
              <li><strong>Sent at:</strong> ${new Date().toISOString()}</li>
              <li><strong>Recipient:</strong> ${to}</li>
              <li><strong>SMTP Server:</strong> ${this.configService.get('SMTP_HOST')}</li>
              <li><strong>Port:</strong> ${this.configService.get('SMTP_PORT')}</li>
            </ul>
          </div>
          
          <p>✅ If you received this email, your Postfix configuration is working correctly!</p>
          
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Sent from NestJS Email Service
          </p>
        </div>
      `,
      text: `
        Test Email from NestJS + Postfix
        
        This test email was sent at: ${new Date().toISOString()}
        Recipient: ${to}
        SMTP: ${this.configService.get('SMTP_HOST')}:${this.configService.get('SMTP_PORT')}
        
        If you received this email, your Postfix configuration is working!
      `,
    };

    return await this.sendEmail(testContent);
  }

  async getConnectionInfo() {
    const isConnected = await this.verifyConnection();
    
    return {
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      fromEmail: this.configService.get('FROM_EMAIL'),
      fromName: this.configService.get('FROM_NAME'),
      isConnected,
      hasAuth: !!(this.configService.get('SMTP_USER') && this.configService.get('SMTP_PASSWORD')),
    };
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}