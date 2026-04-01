import api from './api';

export enum NotificationType {
  EVENT_REMINDER = 'event_reminder',
  EVENT_UPDATED = 'event_updated',
  EVENT_CANCELLED = 'event_cancelled',
  TICKET_PURCHASED = 'ticket_purchased',
  ORDER_CONFIRMED = 'order_confirmed',
  REFUND_PROCESSED = 'refund_processed',
}

export interface Notification {
  id: string;
  userId: string;
  eventId?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    images?: string[];
    startAt: string;
  };
}

class NotificationService {
  async getNotifications(limit = 50): Promise<Notification[]> {
    const response = await api.get<Notification[]>(`/notifications?limit=${limit}`);
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  }

  async markAsRead(id: string): Promise<void> {
    await api.post(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  }

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  async deleteAll(): Promise<void> {
    await api.delete('/notifications');
  }
}

export default new NotificationService();
