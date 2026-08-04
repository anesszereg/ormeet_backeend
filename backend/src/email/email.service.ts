import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import {
  welcomeEmailHtml,
  verificationEmailHtml,
  passwordResetEmailHtml,
  passwordChangedEmailHtml,
  loginNotificationEmailHtml,
  verificationCodeEmailHtml,
  orderConfirmationEmailHtml,
  teamInviteEmailHtml,
  eventReminderEmailHtml,
  checkInConfirmationEmailHtml,
  newsletterSubscriptionEmailHtml,
} from "./email-templates";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get("RESEND_API_KEY"));
    this.fromEmail =
      this.configService.get("EMAIL_FROM") || "Ormeet <onboarding@resend.dev>";

    this.logger.log("📧 Email service initialized with Resend HTTP API");
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

  async sendWelcomeEmail(
    email: string,
    name: string,
    verificationToken: string,
  ) {
    const frontendUrl =
      this.configService.get("FRONTEND_URL") || "http://localhost:5173";
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    try {
      this.logger.log(`📧 Sending welcome email to: ${email}`);
      await this.sendEmail(
        email,
        "Welcome to Ormeet — Verify Your Email",
        welcomeEmailHtml(name, verificationUrl),
      );
      this.logger.log(`✅ Welcome email sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send welcome email to: ${email}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendEmailVerification(
    email: string,
    name: string,
    verificationToken: string,
  ) {
    const frontendUrl =
      this.configService.get("FRONTEND_URL") || "http://localhost:5173";
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    try {
      this.logger.log(`📧 Sending verification email to: ${email}`);
      await this.sendEmail(
        email,
        "Verify Your Email — Ormeet",
        verificationEmailHtml(name, verificationUrl),
      );
      this.logger.log(`✅ Verification email sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send verification email to: ${email}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string,
  ) {
    const frontendUrl =
      this.configService.get("FRONTEND_URL") || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      this.logger.log(`📧 Sending password reset email to: ${email}`);
      await this.sendEmail(
        email,
        "Reset Your Password — Ormeet",
        passwordResetEmailHtml(name, resetUrl),
      );
      this.logger.log(`✅ Password reset email sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send password reset email to: ${email}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendPasswordChangedEmail(email: string, name: string) {
    try {
      this.logger.log(`📧 Sending password changed confirmation to: ${email}`);
      const supportEmail =
        this.configService.get("EMAIL_USER") || "hello@ormeet.com";
      await this.sendEmail(
        email,
        "Password Changed — Ormeet",
        passwordChangedEmailHtml(name, supportEmail),
      );
      this.logger.log(
        `✅ Password changed email sent successfully to: ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send password changed email to: ${email}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendLoginNotification(
    email: string,
    name: string,
    ipAddress: string,
    userAgent: string,
  ) {
    try {
      this.logger.log(
        `📧 Sending login notification to: ${email} (IP: ${ipAddress})`,
      );
      const loginTime = new Date().toLocaleString();
      await this.sendEmail(
        email,
        "New Login Detected — Ormeet",
        loginNotificationEmailHtml(name, loginTime, ipAddress, userAgent),
      );
      this.logger.log(`✅ Login notification sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send login notification to: ${email}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendVerificationCode(email: string, code: string, purpose: string) {
    try {
      this.logger.log(
        `📧 Sending verification code to: ${email} (Purpose: ${purpose})`,
      );
      const subjectMap: Record<string, string> = {
        login: "Your Login Code — Ormeet",
        registration: "Complete Your Registration — Ormeet",
        email_verification: "Verify Your Email — Ormeet",
        phone_verification: "Verify Your Phone — Ormeet",
        password_reset: "Reset Your Password — Ormeet",
      };
      const subject = subjectMap[purpose] || "Your Verification Code — Ormeet";
      await this.sendEmail(
        email,
        subject,
        verificationCodeEmailHtml(code, purpose),
      );
      this.logger.log(`✅ Verification code sent successfully to: ${email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send verification code to: ${email}`,
        error.stack,
      );
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
      await this.sendEmail(
        orderData.email,
        `Order Confirmed — ${orderData.eventTitle}`,
        orderConfirmationEmailHtml(orderData),
      );
      this.logger.log(
        `✅ Order confirmation sent successfully to: ${orderData.email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send order confirmation to: ${orderData.email}`,
        error.stack,
      );
      console.error("Email error:", error);
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
      const frontendUrl =
        this.configService.get("FRONTEND_URL") || "http://localhost:5173";
      const inviteUrl = `${frontendUrl}/join-team?code=${inviteData.inviteCode}`;
      await this.sendEmail(
        inviteData.email,
        `You're invited to join ${inviteData.organizationName} — Ormeet`,
        teamInviteEmailHtml(
          inviteData.inviterName,
          inviteData.organizationName,
          inviteData.roleName,
          inviteData.inviteCode,
          inviteUrl,
        ),
      );
      this.logger.log(
        `✅ Team invite email sent successfully to: ${inviteData.email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send team invite email to: ${inviteData.email}`,
        error.stack,
      );
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
      this.logger.log(
        `📧 Sending event reminder to: ${reminderData.email} (${reminderData.hoursUntilEvent}h before)`,
      );
      const frontendUrl =
        this.configService.get("FRONTEND_URL") || "http://localhost:5173";
      const timeLabel =
        reminderData.hoursUntilEvent >= 24
          ? `${Math.round(reminderData.hoursUntilEvent / 24)} day(s)`
          : reminderData.hoursUntilEvent === 0
            ? "now"
            : `${reminderData.hoursUntilEvent} hour(s)`;
      await this.sendEmail(
        reminderData.email,
        `⏰ Reminder: ${reminderData.eventTitle} starts in ${timeLabel}!`,
        eventReminderEmailHtml({ ...reminderData, frontendUrl }),
      );
      this.logger.log(
        `✅ Event reminder sent successfully to: ${reminderData.email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send event reminder to: ${reminderData.email}`,
        error.stack,
      );
      console.error("Email error:", error);
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
      this.logger.log(
        `📧 Sending check-in confirmation to: ${checkInData.email}`,
      );
      const supportEmail =
        this.configService.get("SUPPORT_EMAIL") || "support@ormeet.com";
      await this.sendEmail(
        checkInData.email,
        `✓ Check-In Confirmed — ${checkInData.eventTitle}`,
        checkInConfirmationEmailHtml({ ...checkInData, supportEmail }),
      );
      this.logger.log(
        `✅ Check-in confirmation sent successfully to: ${checkInData.email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send check-in confirmation to: ${checkInData.email}`,
        error.stack,
      );
      console.error("Email error:", error);
    }
  }

  async sendNewsletterSubscriptionEmail(email: string, locale: string = "en") {
    try {
      this.logger.log(
        `📧 Sending newsletter subscription confirmation to: ${email}`,
      );
      await this.sendEmail(
        email,
        "Welcome to the Ormeet Newsletter",
        newsletterSubscriptionEmailHtml(locale),
      );
      this.logger.log(
        `✅ Newsletter subscription confirmation sent successfully to: ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send newsletter subscription confirmation to: ${email}`,
        (error as Error)?.stack,
      );
      throw error;
    }
  }
}
