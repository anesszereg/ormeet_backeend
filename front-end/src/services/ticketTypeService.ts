import api from './api';

// ========== Types ==========

export interface TicketType {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
  maxPerOrder?: number;
  salesStart?: string;
  salesEnd?: string;
  ticketBenefits?: string[];
  isVisible: boolean;
  isFree: boolean;
  type: 'general' | 'vip' | 'early-bird';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketTypeDto {
  eventId: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  quantityTotal: number;
  salesStart?: string;
  salesEnd?: string;
}

export interface UpdateTicketTypeDto extends Partial<CreateTicketTypeDto> {}

// ========== Service ==========

class TicketTypeService {
  async getAll(eventId?: string): Promise<TicketType[]> {
    const response = await api.get<TicketType[]>('/ticket-types', {
      params: eventId ? { eventId } : undefined,
    });
    return response.data;
  }

  async getByEvent(eventId: string): Promise<TicketType[]> {
    const response = await api.get<TicketType[]>(`/ticket-types/event/${eventId}`);
    return response.data;
  }

  async getById(id: string): Promise<TicketType> {
    const response = await api.get<TicketType>(`/ticket-types/${id}`);
    return response.data;
  }

  async getAvailableQuantity(id: string): Promise<number> {
    const response = await api.get<number>(`/ticket-types/${id}/available`);
    return response.data;
  }

  async isAvailable(id: string): Promise<boolean> {
    const response = await api.get<boolean>(`/ticket-types/${id}/is-available`);
    return response.data;
  }

  async create(data: CreateTicketTypeDto): Promise<TicketType> {
    const response = await api.post<TicketType>('/ticket-types', data);
    return response.data;
  }

  async update(id: string, data: UpdateTicketTypeDto): Promise<TicketType> {
    const response = await api.patch<TicketType>(`/ticket-types/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/ticket-types/${id}`);
  }
}

export default new TicketTypeService();
