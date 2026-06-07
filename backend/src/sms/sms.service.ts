import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * SMS delivery via the Twilio REST API.
 *
 * Uses the native `fetch` API (Node 18+) so no extra SDK dependency is needed.
 * If Twilio credentials are not configured, messages are logged to the console
 * instead, which keeps local/dev flows working without an account.
 *
 * Required environment variables (see .env.example):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER  (the Twilio sender number, e.g. +15551234567)
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly accountSid?: string;
  private readonly authToken?: string;
  private readonly fromNumber?: string;

  constructor(private readonly configService: ConfigService) {
    this.accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');
  }

  get isConfigured(): boolean {
    return Boolean(this.accountSid && this.authToken && this.fromNumber);
  }

  /**
   * Send an SMS message. Returns true if the message was accepted by Twilio,
   * false if it fell back to console logging or failed.
   */
  async sendSms(to: string, body: string): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.warn(
        `Twilio not configured. SMS to ${to} would read: "${body}"`,
      );
      return false;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    const params = new URLSearchParams({
      To: to,
      From: this.fromNumber as string,
      Body: body,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Twilio SMS failed (${response.status}): ${errorText}`);
        return false;
      }

      this.logger.log(`SMS sent to ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Twilio SMS error: ${error?.message || error}`);
      return false;
    }
  }

  /**
   * Send a verification code via SMS with a friendly message.
   */
  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    return this.sendSms(to, `Your Ormeet verification code is ${code}. It expires in 10 minutes.`);
  }
}
