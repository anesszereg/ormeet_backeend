import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendWelcomeEmail(email: string, name: string, verificationToken: string) {
    const verificationUrl = `${this.configService.get('APP_URL')}/auth/verify-email?token=${verificationToken}`;

    try {
      this.logger.log(`📧 Sending welcome email to: ${email}`);
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Ormeet - Verify Your Email',
        template: './welcome',
        context: {
          name,
          verificationUrl,
          appName: 'Ormeet',
        },
      });

      this.logger.log(`✅ Welcome email sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email to: ${email}`, error.stack);
      throw error;
    }
  }

  async sendEmailVerification(email: string, name: string, verificationToken: string) {
    const verificationUrl = `${this.configService.get('APP_URL')}/auth/verify-email?token=${verificationToken}`;

    try {
      this.logger.log(`📧 Sending verification email to: ${email}`);
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your Email - Ormeet',
        template: './verify-email',
        context: {
          name,
          verificationUrl,
          appName: 'Ormeet',
        },
      });

      this.logger.log(`✅ Verification email sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send verification email to: ${email}`, error.stack);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string) {
    const resetUrl = `${this.configService.get('APP_URL')}/auth/reset-password?token=${resetToken}`;

    try {
      this.logger.log(`📧 Sending password reset email to: ${email}`);
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your Password - Ormeet',
        template: './reset-password',
        context: {
          name,
          resetUrl,
          appName: 'Ormeet',
          expirationTime: '1 hour',
        },
      });

      this.logger.log(`✅ Password reset email sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send password reset email to: ${email}`, error.stack);
      throw error;
    }
  }

  async sendPasswordChangedEmail(email: string, name: string) {
    try {
      this.logger.log(`📧 Sending password changed confirmation to: ${email}`);
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Changed Successfully - Ormeet',
        template: './password-changed',
        context: {
          name,
          appName: 'Ormeet',
          supportEmail: this.configService.get('EMAIL_USER'),
        },
      });

      this.logger.log(`✅ Password changed email sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send password changed email to: ${email}`, error.stack);
      throw error;
    }
  }

  async sendLoginNotification(email: string, name: string, ipAddress: string, userAgent: string) {
    try {
      this.logger.log(`📧 Sending login notification to: ${email} (IP: ${ipAddress})`);
      
      await this.mailerService.sendMail({
        to: email,
        subject: 'New Login to Your Account - Ormeet',
        template: './login-notification',
        context: {
          name,
          ipAddress,
          userAgent,
          loginTime: new Date().toLocaleString(),
          appName: 'Ormeet',
        },
      });

      this.logger.log(`✅ Login notification sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send login notification to: ${email}`, error.stack);
      throw error;
    }
  }
}
