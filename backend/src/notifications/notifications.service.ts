import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    eventId?: string,
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      eventId,
      metadata,
      read: false,
    });
    return await this.notificationRepository.save(notification);
  }

  async findByUser(userId: string, limit = 50): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { userId },
      relations: ['event'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id, userId },
      { read: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({ id, userId });
  }

  async deleteAll(userId: string): Promise<void> {
    await this.notificationRepository.delete({ userId });
  }

  // Helper methods for creating specific notification types
  async createEventReminder(userId: string, eventId: string, eventName: string, startTime: Date): Promise<Notification> {
    const timeUntil = this.getTimeUntilEvent(startTime);
    return this.create(
      userId,
      NotificationType.EVENT_REMINDER,
      'Event Reminder',
      `${eventName} ${timeUntil} — don't forget to check in!`,
      eventId,
    );
  }

  async createEventUpdate(userId: string, eventId: string, eventName: string, updateMessage: string): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.EVENT_UPDATED,
      'Event Updated',
      `${eventName}: ${updateMessage}`,
      eventId,
    );
  }

  async createEventCancellation(userId: string, eventId: string, eventName: string): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.EVENT_CANCELLED,
      'Event Cancelled',
      `${eventName} has been cancelled. A refund will be processed.`,
      eventId,
    );
  }

  async createTicketPurchase(userId: string, eventId: string, eventName: string, ticketCount: number): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.TICKET_PURCHASED,
      'Tickets Purchased',
      `You've successfully purchased ${ticketCount} ticket${ticketCount > 1 ? 's' : ''} for ${eventName}`,
      eventId,
    );
  }

  async createOrderConfirmation(userId: string, eventId: string, eventName: string, orderId: string): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.ORDER_CONFIRMED,
      'Order Confirmed',
      `Your order for ${eventName} has been confirmed. Order ID: ${orderId}`,
      eventId,
      { orderId },
    );
  }

  async createRefundProcessed(userId: string, eventId: string, eventName: string, amount: number): Promise<Notification> {
    return this.create(
      userId,
      NotificationType.REFUND_PROCESSED,
      'Refund Processed',
      `Your refund of $${amount.toFixed(2)} for ${eventName} has been processed.`,
      eventId,
      { amount },
    );
  }

  private getTimeUntilEvent(startTime: Date): string {
    const now = new Date();
    const diffMs = startTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) return 'starts tomorrow';
    if (diffDays === 1) return 'starts tomorrow';
    if (diffDays < 7) return `starts in ${diffDays} days`;
    return `starts soon`;
  }
}
