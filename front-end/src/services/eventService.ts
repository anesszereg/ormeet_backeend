import api from './api';

export interface Event {
  id: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
    logo?: string;
  };
  status: 'draft' | 'published' | 'cancelled';
  category?: string;
  tags?: string[];
  images?: string[];
  videos?: string[];
  locationType: 'physical' | 'online' | 'to_be_announced';
  venueId?: string;
  venue?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state?: string;
    country: string;
  };
  customLocation?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    postalCode: string;
    country: string;
  };
  onlineLink?: string;
  onlineInstructions?: string;
  dateType: 'one_time' | 'multiple';
  startAt: string;
  endAt: string;
  timezone?: string;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurringCount?: number;
  recurringEndDate?: string;
  sessions?: Array<{
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    speakers: string[];
  }>;
  capacity?: number;
  ageLimit?: number;
  allowReentry?: boolean;
  refundsAllowed?: boolean;
  guidelines?: {
    ageRequirement: string;
    refundPolicy: string;
    accessibleInfo: string;
    entryPolicy: string;
    prohibitedItems: string[];
    allowedItems: string[];
    parkingInfo: string;
  };
  publishedAt?: string;
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
  ticketTypes?: Array<{
    id: string;
    title: string;
    price: number;
    type: string;
    quantityTotal: number;
    quantitySold: number;
  }>;
  speakers?: Array<{
    name: string;
    role: string;
    bio: string;
    image: string;
  }>;
  performers?: Array<{
    company: string;
    type: string;
    description: string;
    image: string;
  }>;
  sponsors?: Array<{
    sponsorName: string;
    sponsorshipTier: string;
    about: string;
    logo: string;
  }>;
}

export interface CreateEventDto {
  title: string;
  shortDescription: string;
  longDescription?: string;
  startAt: string;
  endAt: string;
  category?: string;
  organizerId: string;
  venueId?: string;
  capacity?: number;
  images?: string[];
  locationType?: 'physical' | 'online' | 'to_be_announced';
}

class EventService {
  async getAllEvents(params?: {
    status?: string;
    category?: string;
    organizerId?: string;
  }) {
    const response = await api.get<Event[]>('/events', { params });
    return response.data;
  }

  async getEventById(id: string) {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  }

  async createEvent(data: CreateEventDto) {
    const response = await api.post<Event>('/events', data);
    return response.data;
  }

  async updateEvent(id: string, data: Partial<CreateEventDto>) {
    const response = await api.patch<Event>(`/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: string) {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  }

  async publishEvent(id: string) {
    const response = await api.post(`/events/${id}/publish`);
    return response.data;
  }

  async cancelEvent(id: string) {
    const response = await api.post(`/events/${id}/cancel`);
    return response.data;
  }

  async favoriteEvent(id: string) {
    const response = await api.post(`/events/${id}/favorite`);
    return response.data;
  }

  async incrementView(id: string) {
    const response = await api.post(`/events/${id}/view`);
    return response.data;
  }

  async sendReminders(id: string) {
    const response = await api.post<{ message: string }>(`/events/${id}/send-reminders`);
    return response.data;
  }
}

export default new EventService();
