import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event, EventStatus, Ticket, TicketStatus, LocationType } from '../entities';
import { EmailService } from './email.service';

@Injectable()
export class EventReminderService {
  private readonly logger = new Logger(EventReminderService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Runs every hour — sends reminders 24h and 1h before event start
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleEventReminders() {
    this.logger.log('⏰ Running event reminder cron job...');

    try {
      await this.sendReminders(24); // 24-hour reminder
      await this.sendReminders(1);  // 1-hour reminder
    } catch (error) {
      this.logger.error('❌ Event reminder cron job failed', error.stack);
    }
  }

  private async sendReminders(hoursBeforeEvent: number) {
    const now = new Date();
    const windowStart = new Date(now.getTime() + (hoursBeforeEvent - 0.5) * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + (hoursBeforeEvent + 0.5) * 60 * 60 * 1000);

    // Find published events starting within the window
    const upcomingEvents = await this.eventRepository.find({
      where: {
        status: EventStatus.PUBLISHED,
        startAt: Between(windowStart, windowEnd),
      },
      relations: ['venue'],
    });

    if (upcomingEvents.length === 0) {
      return;
    }

    this.logger.log(`📋 Found ${upcomingEvents.length} events starting in ~${hoursBeforeEvent}h`);

    for (const event of upcomingEvents) {
      await this.sendRemindersForEvent(event, hoursBeforeEvent);
    }
  }

  async sendRemindersForEvent(event: Event, hoursUntilEvent: number) {
    // Find all active tickets for this event with their owners
    const tickets = await this.ticketRepository.find({
      where: {
        eventId: event.id,
        status: TicketStatus.ACTIVE,
      },
      relations: ['owner', 'ticketType'],
    });

    if (tickets.length === 0) {
      return;
    }

    this.logger.log(`📧 Sending ${hoursUntilEvent}h reminders for "${event.title}" to ${tickets.length} attendees`);

    const eventLocation = this.getEventLocation(event);
    const eventDate = event.startAt.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Deduplicate by owner email (one reminder per attendee per event)
    const sentEmails = new Set<string>();

    for (const ticket of tickets) {
      if (!ticket.owner?.email || sentEmails.has(ticket.owner.email)) {
        continue;
      }

      sentEmails.add(ticket.owner.email);

      try {
        await this.emailService.sendEventReminder({
          email: ticket.owner.email,
          attendeeName: ticket.owner.name || 'Attendee',
          eventTitle: event.title,
          eventDate,
          eventLocation,
          ticketCode: ticket.code,
          ticketType: ticket.ticketType?.title,
          hoursUntilEvent,
        });
      } catch (error) {
        this.logger.error(
          `❌ Failed to send reminder to ${ticket.owner.email} for event "${event.title}"`,
          error.stack,
        );
      }
    }

    this.logger.log(`✅ Sent ${sentEmails.size} reminders for "${event.title}"`);
  }

  private getEventLocation(event: Event): string {
    if (event.locationType === LocationType.ONLINE) {
      return 'Online Event';
    }
    if (event.locationType === LocationType.TO_BE_ANNOUNCED) {
      return 'Location TBA';
    }
    if (event.venue) {
      return `${event.venue.name}${event.venue.city ? `, ${event.venue.city}` : ''}`;
    }
    if (event.customLocation) {
      return `${event.customLocation.address}, ${event.customLocation.city}`;
    }
    return 'See event details';
  }
}
