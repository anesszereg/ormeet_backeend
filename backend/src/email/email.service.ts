import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendWelcomeEmail(email: string, name: string, verificationToken: string) {
    const verificationUrl = `${this.configService.get('APP_URL')}/auth/verify-email?token=${verificationToken}`;

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
  }

  async sendEmailVerification(email: string, name: string, verificationToken: string) {
    const verificationUrl = `${this.configService.get('APP_URL')}/auth/verify-email?token=${verificationToken}`;

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
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string) {
    const resetUrl = `${this.configService.get('APP_URL')}/auth/reset-password?token=${resetToken}`;

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
  }

  async sendPasswordChangedEmail(email: string, name: string) {
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
  }

  async sendLoginNotification(email: string, name: string, ipAddress: string, userAgent: string) {
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
  }
}
