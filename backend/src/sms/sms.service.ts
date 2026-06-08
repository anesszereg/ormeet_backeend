import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * SMS delivery via the MessageBird REST API.
 *
 * Uses the native `fetch` API (Node 18+) so no extra SDK dependency is needed.
 * If MessageBird credentials are not configured, messages are logged to the
 * console instead, which keeps local/dev flows working without an account.
 *
 * Required environment variables (see .env.example):
 *   MESSAGEBIRD_API_KEY    — live or test API key from MessageBird dashboard
 *   MESSAGEBIRD_ORIGINATOR — sender ID or phone number (e.g. Ormeet or +15551234567)
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey?: string;
  private readonly originator?: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MESSAGEBIRD_API_KEY');
    this.originator = this.configService.get<string>('MESSAGEBIRD_ORIGINATOR');
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.originator);
  }

  /**
   * Send an SMS message. Returns true if MessageBird accepted the message,
   * false if it fell back to console logging or failed.
   */
  async sendSms(to: string, body: string): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.warn(
        `MessageBird not configured. SMS to ${to} would read: "${body}"`,
      );
      return false;
    }

    try {
      const response = await fetch('https://rest.messagebird.com/messages', {
        method: 'POST',
        headers: {
          Authorization: `AccessKey ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originator: this.originator,
          recipients: [to],
          body,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`MessageBird SMS failed (${response.status}): ${errorText}`);
        return false;
      }

      this.logger.log(`SMS sent to ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`MessageBird SMS error: ${error?.message || error}`);
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
