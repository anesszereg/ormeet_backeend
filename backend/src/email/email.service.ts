import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
    this.fromEmail = this.configService.get('EMAIL_FROM') || 'Ormeet <onboarding@resend.dev>';

    this.logger.log('📧 Email service initialized with Resend HTTP API');
  }

  private async sendEmail(to: string, subject: string, html: string) {
    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: [to],
      subject,
      html,
    });

    if (error) {
      throw new Error(`Resend error: ${JSON.stringify(error)}`);
    }

    this.logger.log(`📧 Email sent: ${data?.id}`);
    return data;
  }

  async sendWelcomeEmail(email: string, name: string, verificationToken: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    try {
      this.logger.log(`📧 Sending welcome email to: ${email}`);

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}.content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px}.button{display:inline-block;padding:12px 30px;background:#667eea;color:white;text-decoration:none;border-radius:5px;margin:20px 0}.footer{text-align:center;margin-top:30px;color:#666;font-size:12px}</style></head><body><div class="header"><h1>🎉 Welcome to Ormeet!</h1></div><div class="content"><p>Hi ${name},</p><p>Thank you for joining <strong>Ormeet</strong> - your ultimate event organization platform!</p><p>To get started, please verify your email address by clicking the button below:</p><center><a href="${verificationUrl}" class="button">Verify Email Address</a></center><p>Or copy and paste this link into your browser:</p><p style="word-break:break-all;color:#667eea;">${verificationUrl}</p><p><strong>What you can do with Ormeet:</strong></p><ul><li>🎫 Discover and book amazing events</li><li>🏢 Create and manage your own events</li><li>📍 Find venues near you</li><li>💳 Secure ticket purchasing</li><li>⭐ Share reviews and ratings</li></ul><p>If you didn't create this account, please ignore this email.</p><p>Best regards,<br>The Ormeet Team</p></div><div class="footer"><p>&copy; 2025 Ormeet. All rights reserved.</p></div></body></html>`;

      await this.sendEmail(email, 'Welcome to Ormeet - Verify Your Email', html);

      this.logger.log(`✅ Welcome email sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email to: ${email}`, error.stack);
      throw error;
    }
  }

  async sendEmailVerification(email: string, name: string, verificationToken: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    try {
      this.logger.log(`📧 Sending verification email to: ${email}`);

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background:#667eea;color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}.content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px}.button{display:inline-block;padding:12px 30px;background:#667eea;color:white;text-decoration:none;border-radius:5px;margin:20px 0}.footer{text-align:center;margin-top:30px;color:#666;font-size:12px}</style></head><body><div class="header"><h1>📧 Verify Your Email</h1></div><div class="content"><p>Hi ${name},</p><p>Please verify your email address to complete your registration on Ormeet.</p><center><a href="${verificationUrl}" class="button">Verify Email Address</a></center><p>Or copy and paste this link:</p><p style="word-break:break-all;color:#667eea;">${verificationUrl}</p><p>This link will expire in 24 hours.</p><p>If you didn't request this, please ignore this email.</p><p>Best regards,<br>The Ormeet Team</p></div><div class="footer"><p>&copy; 2025 Ormeet. All rights reserved.</p></div></body></html>`;

      await this.sendEmail(email, 'Verify Your Email - Ormeet', html);

      this.logger.log(`✅ Verification email sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send verification email to: ${email}`, error.stack);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      this.logger.log(`📧 Sending password reset email to: ${email}`);

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background:#f59e0b;color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}.content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px}.button{display:inline-block;padding:12px 30px;background:#f59e0b;color:white;text-decoration:none;border-radius:5px;margin:20px 0}.warning{background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0}.footer{text-align:center;margin-top:30px;color:#666;font-size:12px}</style></head><body><div class="header"><h1>🔒 Reset Your Password</h1></div><div class="content"><p>Hi ${name},</p><p>We received a request to reset your password for your Ormeet account.</p><center><a href="${resetUrl}" class="button">Reset Password</a></center><p>Or copy and paste this link:</p><p style="word-break:break-all;color:#f59e0b;">${resetUrl}</p><div class="warning"><strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</div><p>For security reasons, never share this link with anyone.</p><p>Best regards,<br>The Ormeet Team</p></div><div class="footer"><p>&copy; 2025 Ormeet. All rights reserved.</p></div></body></html>`;

      await this.sendEmail(email, 'Reset Your Password - Ormeet', html);

      this.logger.log(`✅ Password reset email sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send password reset email to: ${email}`, error.stack);
      throw error;
    }
  }

  async sendPasswordChangedEmail(email: string, name: string) {
    try {
      this.logger.log(`📧 Sending password changed confirmation to: ${email}`);

      const supportEmail = this.configService.get('EMAIL_USER') || 'hello@ormeet.com';
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background:#10b981;color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}.content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px}.alert{background:#fef2f2;border-left:4px solid #ef4444;padding:15px;margin:20px 0}.footer{text-align:center;margin-top:30px;color:#666;font-size:12px}</style></head><body><div class="header"><h1>✅ Password Changed Successfully</h1></div><div class="content"><p>Hi ${name},</p><p>Your password for Ormeet has been successfully changed.</p><div class="alert"><strong>🔐 Security Notice:</strong> If you didn't make this change, please contact our support team immediately at <a href="mailto:${supportEmail}">${supportEmail}</a></div><p><strong>Security Tips:</strong></p><ul><li>Never share your password with anyone</li><li>Use a unique password for each account</li><li>Enable two-factor authentication when available</li><li>Change your password regularly</li></ul><p>Best regards,<br>The Ormeet Team</p></div><div class="footer"><p>&copy; 2025 Ormeet. All rights reserved.</p></div></body></html>`;

      await this.sendEmail(email, 'Password Changed Successfully - Ormeet', html);

      this.logger.log(`✅ Password changed email sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send password changed email to: ${email}`, error.stack);
      throw error;
    }
  }

  async sendLoginNotification(email: string, name: string, ipAddress: string, userAgent: string) {
    try {
      this.logger.log(`📧 Sending login notification to: ${email} (IP: ${ipAddress})`);

      const loginTime = new Date().toLocaleString();
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background:#3b82f6;color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}.content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px}.info-box{background:#dbeafe;border-left:4px solid #3b82f6;padding:15px;margin:20px 0}.footer{text-align:center;margin-top:30px;color:#666;font-size:12px}</style></head><body><div class="header"><h1>🔔 New Login Detected</h1></div><div class="content"><p>Hi ${name},</p><p>We detected a new login to your Ormeet account.</p><div class="info-box"><p><strong>Login Details:</strong></p><ul style="margin:10px 0;"><li><strong>Time:</strong> ${loginTime}</li><li><strong>IP Address:</strong> ${ipAddress}</li><li><strong>Device:</strong> ${userAgent}</li></ul></div><p>If this was you, you can safely ignore this email.</p><p><strong>If this wasn't you:</strong></p><ol><li>Change your password immediately</li><li>Review your recent account activity</li><li>Contact our support team</li></ol><p>Best regards,<br>The Ormeet Team</p></div><div class="footer"><p>&copy; 2025 Ormeet. All rights reserved.</p></div></body></html>`;

      await this.sendEmail(email, 'New Login to Your Account - Ormeet', html);

      this.logger.log(`✅ Login notification sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send login notification to: ${email}`, error.stack);
      throw error;
    }
  }

  async sendVerificationCode(email: string, code: string, purpose: string) {
    try {
      this.logger.log(`📧 Sending verification code to: ${email} (Purpose: ${purpose})`);

      const subjectMap = {
        login: 'Your Login Code - Ormeet',
        registration: 'Complete Your Registration - Ormeet',
        email_verification: 'Verify Your Email - Ormeet',
        phone_verification: 'Verify Your Phone - Ormeet',
        password_reset: 'Reset Your Password - Ormeet',
      };

      const subject = subjectMap[purpose] || 'Your Verification Code - Ormeet';

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}.content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px}.code-box{background:white;border:2px dashed #667eea;padding:20px;text-align:center;margin:20px 0;border-radius:8px}.code{font-size:36px;font-weight:bold;color:#667eea;letter-spacing:8px;font-family:'Courier New',monospace}.warning{background:#fff3cd;border-left:4px solid #ffc107;padding:12px;margin:20px 0;border-radius:4px}.footer{text-align:center;margin-top:30px;color:#666;font-size:12px}</style></head><body><div class="header"><h1>🔐 Your Verification Code</h1></div><div class="content"><p>Hello,</p><p>You requested a verification code for your Ormeet account.</p><div class="code-box"><p style="margin:0;color:#666;font-size:14px;">Your verification code is:</p><div class="code">${code}</div><p style="margin:10px 0 0 0;color:#999;font-size:12px;">This code expires in 10 minutes</p></div><p><strong>Purpose:</strong> ${purpose}</p><div class="warning"><strong>⚠️ Security Notice:</strong><ul style="margin:10px 0 0 0;padding-left:20px;"><li>Never share this code with anyone</li><li>Ormeet will never ask for your code via phone or email</li><li>This code is valid for 10 minutes only</li><li>You have 3 attempts to enter the correct code</li></ul></div><p>If you didn't request this code, please ignore this email.</p><p>Best regards,<br>The Ormeet Team</p></div><div class="footer"><p>&copy; 2025 Ormeet. All rights reserved.</p><p>This is an automated message, please do not reply to this email.</p></div></body></html>`;

      await this.sendEmail(email, subject, html);

      this.logger.log(`✅ Verification code sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send verification code to: ${email}`, error.stack);
      throw error;
    }
  }

  async sendOrderConfirmation(orderData: {
    email: string;
    customerName: string;
    orderId: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    tickets: Array<{
      id: string;
      code: string;
      ticketType: string;
      price: number;
      qrCodeBuffer: Buffer;
    }>;
    subtotal: number;
    discount: number;
    serviceFee: number;
    processingFee: number;
    total: number;
    currency: string;
    pdfTicket?: Buffer;
  }) {
    try {
      this.logger.log(`📧 Sending order confirmation to: ${orderData.email}`);

      const ticketsHtml = orderData.tickets.map(ticket => `
        <div style="background:#fff;border:2px solid #e0e0e0;padding:25px;margin-bottom:20px;border-left:5px solid #FF4000;">
          <div style="display:flex;justify-content:space-between;margin-bottom:15px;padding-bottom:15px;border-bottom:1px solid #e0e0e0;">
            <span style="font-size:18px;font-weight:600;">${ticket.ticketType}</span>
            <span style="font-size:20px;font-weight:700;color:#FF4000;">${orderData.currency} ${ticket.price}</span>
          </div>
          <div style="background:#f8f9fa;border:1px dashed #bdc3c7;padding:12px;text-align:center;font-family:'Courier New',monospace;font-size:15px;letter-spacing:3px;font-weight:600;">Ticket Code: ${ticket.code}</div>
        </div>
      `).join('');

      const supportEmail = this.configService.get('SUPPORT_EMAIL') || 'support@ormeet.com';

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Georgia,'Times New Roman',serif;line-height:1.8;color:#2c3e50;max-width:650px;margin:0 auto;padding:20px;background-color:#f8f9fa}</style></head><body><div style="background:#fff;border:1px solid #e0e0e0;box-shadow:0 4px 6px rgba(0,0,0,0.07);"><div style="background:linear-gradient(135deg,#2c3e50 0%,#34495e 100%);padding:40px 30px;text-align:center;border-bottom:3px solid #FF4000;"><h1 style="color:#fff;margin:0;font-size:28px;font-weight:400;letter-spacing:1px;">Order Confirmation</h1><div style="display:inline-block;background-color:#27ae60;color:white;padding:8px 20px;border-radius:20px;font-size:14px;margin-top:15px;font-family:Arial,sans-serif;">✓ Payment Successful</div></div><div style="padding:30px;"><p style="font-size:16px;">Dear <strong>${orderData.customerName}</strong>,</p><p style="font-size:15px;color:#7f8c8d;">Thank you for your purchase. Your order has been confirmed and your tickets are ready.</p><div style="background:#fafafa;border-left:4px solid #FF4000;padding:20px 25px;margin:25px 0;"><h2 style="margin-top:0;font-size:20px;font-weight:400;">Order Details</h2><p><strong>Order ID:</strong> ${orderData.orderId}</p><p><strong>Tickets:</strong> ${orderData.tickets.length}</p></div><div style="background:#fafafa;border:2px solid #ecf0f1;border-left:5px solid #FF4000;padding:25px;margin:25px 0;"><h3 style="margin-top:0;font-size:22px;">📅 ${orderData.eventTitle}</h3><p>🗓️ ${orderData.eventDate}</p><p>📍 ${orderData.eventLocation}</p></div><h2 style="font-size:22px;font-weight:400;border-bottom:2px solid #ecf0f1;padding-bottom:10px;">Your Event Tickets</h2>${ticketsHtml}<div style="background:#fafafa;border:1px solid #e0e0e0;padding:25px;margin:25px 0;"><h3 style="margin-top:0;font-size:20px;font-weight:400;">Payment Summary</h3><p>Subtotal: ${orderData.currency} ${orderData.subtotal.toFixed(2)}</p>${orderData.discount ? `<p style="color:#4CAF50;">Discount: -${orderData.currency} ${orderData.discount.toFixed(2)}</p>` : ''}<p>Service Fee: ${orderData.currency} ${orderData.serviceFee.toFixed(2)}</p><p>Processing Fee: ${orderData.currency} ${orderData.processingFee.toFixed(2)}</p><p style="font-size:19px;font-weight:700;color:#27ae60;border-top:2px solid #2c3e50;padding-top:15px;margin-top:15px;">Total Paid: ${orderData.currency} ${orderData.total.toFixed(2)}</p></div></div><div style="background:#f8f9fa;text-align:center;padding:30px;border-top:3px solid #FF4000;color:#7f8c8d;font-size:13px;"><p>For assistance, contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p><p style="font-size:11px;color:#bdc3c7;">© 2025 Ormeet. All rights reserved.</p></div></div></body></html>`;

      await this.sendEmail(orderData.email, `Order Confirmation - ${orderData.eventTitle}`, html);

      this.logger.log(`✅ Order confirmation sent successfully to: ${orderData.email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send order confirmation to: ${orderData.email}`, error.stack);
      console.error('Email error:', error);
    }
  }

  async sendTeamInviteEmail(inviteData: {
    email: string;
    organizationName: string;
    inviterName: string;
    roleName: string;
    inviteCode: string;
  }) {
    try {
      this.logger.log(`📧 Sending team invite to: ${inviteData.email}`);

      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
      const inviteUrl = `${frontendUrl}/join-team?code=${inviteData.inviteCode}`;

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#FF4000 0%,#E63900 100%);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}.content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px}.button{display:inline-block;padding:12px 30px;background:#FF4000;color:white;text-decoration:none;border-radius:25px;margin:20px 0;font-weight:600}.info-box{background:#fff;border-left:4px solid #FF4000;padding:15px;margin:20px 0;border-radius:4px}.footer{text-align:center;margin-top:30px;color:#666;font-size:12px}</style></head><body><div class="header"><h1>🤝 You're Invited!</h1></div><div class="content"><p>Hi there,</p><p><strong>${inviteData.inviterName}</strong> has invited you to join <strong>${inviteData.organizationName}</strong> on Ormeet as a <strong>${inviteData.roleName}</strong>.</p><div class="info-box"><p><strong>Organization:</strong> ${inviteData.organizationName}</p><p><strong>Role:</strong> ${inviteData.roleName}</p><p><strong>Invite Code:</strong> ${inviteData.inviteCode}</p></div><center><a href="${inviteUrl}" class="button">Accept Invitation</a></center><p>Or use this invite code when signing up: <strong>${inviteData.inviteCode}</strong></p><p>This invitation will expire in 7 days.</p><p>Best regards,<br>The Ormeet Team</p></div><div class="footer"><p>&copy; 2025 Ormeet. All rights reserved.</p></div></body></html>`;

      await this.sendEmail(inviteData.email, `You're invited to join ${inviteData.organizationName} on Ormeet`, html);

      this.logger.log(`✅ Team invite email sent successfully to: ${inviteData.email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send team invite email to: ${inviteData.email}`, error.stack);
      throw error;
    }
  }

  async sendEventReminder(reminderData: {
    email: string;
    attendeeName: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    ticketCode?: string;
    ticketType?: string;
    hoursUntilEvent: number;
  }) {
    try {
      this.logger.log(`📧 Sending event reminder to: ${reminderData.email} (${reminderData.hoursUntilEvent}h before)`);

      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
      const timeLabel = reminderData.hoursUntilEvent >= 24
        ? `${Math.round(reminderData.hoursUntilEvent / 24)} day(s)`
        : `${reminderData.hoursUntilEvent} hour(s)`;

      const ticketHtml = reminderData.ticketCode
        ? `<div style="background:#fff;border:2px dashed #FF4000;padding:15px;text-align:center;margin:20px 0;border-radius:8px;"><p style="margin:0 0 5px 0;color:#666;font-size:13px;">Your Ticket Code</p><p style="margin:0;font-size:24px;font-weight:bold;color:#FF4000;letter-spacing:4px;font-family:'Courier New',monospace;">${reminderData.ticketCode}</p>${reminderData.ticketType ? `<p style="margin:5px 0 0 0;color:#999;font-size:12px;">${reminderData.ticketType}</p>` : ''}</div>`
        : '';

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#FF4000 0%,#ff6b35 100%);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}.content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px}.event-box{background:#fff;border-left:4px solid #FF4000;padding:20px;margin:20px 0;border-radius:4px}.countdown{background:#fff3e0;border:2px solid #FF4000;padding:20px;text-align:center;margin:20px 0;border-radius:8px}.footer{text-align:center;margin-top:30px;color:#666;font-size:12px}</style></head><body><div class="header"><h1>⏰ Event Reminder</h1><p style="margin:5px 0 0 0;font-size:16px;">Starting in ${timeLabel}!</p></div><div class="content"><p>Hi ${reminderData.attendeeName},</p><p>This is a friendly reminder that your event is coming up soon!</p><div class="event-box"><h2 style="margin-top:0;color:#FF4000;">📅 ${reminderData.eventTitle}</h2><p>🗓️ <strong>Date:</strong> ${reminderData.eventDate}</p><p>📍 <strong>Location:</strong> ${reminderData.eventLocation}</p></div><div class="countdown"><p style="margin:0;font-size:18px;font-weight:bold;color:#FF4000;">⏰ Starts in ${timeLabel}</p></div>${ticketHtml}<p><strong>Quick Checklist:</strong></p><ul><li>✅ Have your ticket ready (digital or printed)</li><li>✅ Check the event location and plan your route</li><li>✅ Arrive 15-30 minutes early for check-in</li><li>✅ Bring a valid ID if required</li></ul><center><a href="${frontendUrl}" style="display:inline-block;padding:12px 30px;background:#FF4000;color:white;text-decoration:none;border-radius:25px;margin:20px 0;font-weight:600;">View Event Details</a></center><p>We hope you have an amazing time!</p><p>Best regards,<br>The Ormeet Team</p></div><div class="footer"><p>&copy; 2025 Ormeet. All rights reserved.</p></div></body></html>`;

      await this.sendEmail(reminderData.email, `⏰ Reminder: ${reminderData.eventTitle} starts in ${timeLabel}!`, html);

      this.logger.log(`✅ Event reminder sent successfully to: ${reminderData.email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send event reminder to: ${reminderData.email}`, error.stack);
      console.error('Email error:', error);
    }
  }

  async sendCheckInConfirmation(checkInData: {
    email: string;
    attendeeName: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    ticketCode: string;
    ticketType: string;
    checkInTime: string;
    checkInMethod: string;
    seatInfo?: string;
  }) {
    try {
      this.logger.log(`📧 Sending check-in confirmation to: ${checkInData.email}`);

      const supportEmail = this.configService.get('SUPPORT_EMAIL') || 'support@ormeet.com';
      const seatHtml = checkInData.seatInfo ? `<p><strong>Seat:</strong> ${checkInData.seatInfo}</p>` : '';

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Georgia,'Times New Roman',serif;line-height:1.8;color:#2c3e50;max-width:650px;margin:0 auto;padding:20px}</style></head><body><div style="background:#fff;border:2px solid #d4af37;border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.12);"><div style="background:linear-gradient(135deg,#1e8449 0%,#27ae60 100%);padding:45px 35px;text-align:center;border-bottom:4px solid #d4af37;"><h1 style="color:#fff;margin:0;font-size:32px;font-weight:300;letter-spacing:2px;">Check-In Confirmed!</h1><div style="display:inline-block;background:#fff;color:#1e8449;padding:10px 28px;border-radius:25px;font-size:15px;margin-top:18px;font-weight:700;">✓ You're All Set</div></div><div style="padding:40px 35px;"><div style="background:linear-gradient(135deg,#e8f5e9 0%,#c8e6c9 100%);border:3px solid #66bb6a;padding:35px 30px;text-align:center;border-radius:12px;margin-bottom:35px;"><h2 style="color:#1e8449;font-size:28px;margin:0 0 10px 0;">Welcome, ${checkInData.attendeeName}!</h2><p style="font-size:17px;font-weight:500;">You have successfully checked in</p><p><strong>Checked in at:</strong> ${checkInData.checkInTime}</p></div><div style="background:linear-gradient(135deg,#fff8f0 0%,#ffe8d6 100%);border:2px solid #d4af37;border-radius:10px;padding:30px;margin:30px 0;"><h3 style="margin-top:0;font-size:24px;border-bottom:2px solid #d4af37;padding-bottom:15px;">📅 ${checkInData.eventTitle}</h3><p>🗓️ ${checkInData.eventDate}</p><p>📍 ${checkInData.eventLocation}</p></div><div style="background:#fff;border:2px solid #e0e0e0;border-radius:10px;padding:30px;margin:30px 0;"><h2 style="margin-top:0;font-size:22px;border-bottom:2px solid #27ae60;padding-bottom:12px;">Check-In Details</h2><p><strong>Ticket Code:</strong> ${checkInData.ticketCode}</p><p><strong>Ticket Type:</strong> ${checkInData.ticketType}</p><p><strong>Method:</strong> ${checkInData.checkInMethod.toUpperCase()}</p>${seatHtml}</div></div><div style="background:linear-gradient(135deg,#2c3e50 0%,#34495e 100%);text-align:center;padding:35px 30px;border-top:4px solid #d4af37;color:#ecf0f1;font-size:13px;"><p>Questions? Contact us at <a href="mailto:${supportEmail}" style="color:#f39c12;">${supportEmail}</a></p><p style="font-size:11px;color:#bdc3c7;">© 2025 Ormeet. All rights reserved.</p></div></div></body></html>`;

      await this.sendEmail(checkInData.email, `✓ Check-In Confirmed - ${checkInData.eventTitle}`, html);

      this.logger.log(`✅ Check-in confirmation sent successfully to: ${checkInData.email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send check-in confirmation to: ${checkInData.email}`, error.stack);
      console.error('Email error:', error);
    }
  }
}
