import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from '../entities';
import { EmailService } from '../email/email.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly subscriberRepository: Repository<NewsletterSubscriber>,
    private readonly emailService: EmailService,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto): Promise<{ message: string }> {
    const { email, locale = 'en' } = dto;

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await this.subscriberRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('This email is already subscribed to our newsletter.');
    }

    const subscriber = this.subscriberRepository.create({
      email: normalizedEmail,
      locale,
      confirmed: true,
    });

    await this.subscriberRepository.save(subscriber);
    this.logger.log(`✅ Newsletter subscription saved: ${normalizedEmail}`);

    try {
      await this.emailService.sendNewsletterSubscriptionEmail(normalizedEmail, locale);
      this.logger.log(`✅ Newsletter confirmation email sent to: ${normalizedEmail}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send newsletter confirmation to ${normalizedEmail}`, error.stack);
      // Don't fail the subscription if the email fails; still return success
    }

    return { message: 'You are subscribed! Check your inbox for a confirmation.' };
  }
}
