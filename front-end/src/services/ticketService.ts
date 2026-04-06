import api from './api';

// ========== Types ==========

export interface Ticket {
  id: string;
  ticketTypeId: string;
  eventId: string;
  orderId: string;
  ownerId: string;
  code: string;
  seatSection?: string;
  seatRow?: string;
  seatNumber?: string;
  status: 'active' | 'used' | 'cancelled';
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
  ticketType?: {
    id: string;
    title: string;
    type: string;
    price: number;
    ticketBenefits?: string[];
  };
  event?: {
    id: string;
    title: string;
    startAt: string;
    endAt: string;
    locationType: string;
    images?: string[];
  };
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateTicketDto {
  ticketTypeId: string;
  eventId: string;
  orderId: string;
  ownerId: string;
  seatSection?: string;
  seatRow?: string;
  seatNumber?: string;
}

export interface UpdateTicketDto {
  seatSection?: string;
  seatRow?: string;
  seatNumber?: string;
}

// ========== Service ==========

class TicketService {
  async getAll(params?: { userId?: string; orderId?: string; status?: string }): Promise<Ticket[]> {
    const response = await api.get<Ticket[]>('/tickets', { params });
    return response.data;
  }

  async getById(id: string): Promise<Ticket> {
    const response = await api.get<Ticket>(`/tickets/${id}`);
    return response.data;
  }

  async getByQRCode(qrCode: string): Promise<Ticket> {
    const response = await api.get<Ticket>(`/tickets/qr/${qrCode}`);
    return response.data;
  }

  async getByUser(userId: string): Promise<Ticket[]> {
    const response = await api.get<Ticket[]>(`/tickets/user/${userId}`);
    return response.data;
  }

  async create(data: CreateTicketDto): Promise<Ticket> {
    const response = await api.post<Ticket>('/tickets', data);
    return response.data;
  }

  async update(id: string, data: UpdateTicketDto): Promise<Ticket> {
    const response = await api.patch<Ticket>(`/tickets/${id}`, data);
    return response.data;
  }

  async cancel(id: string): Promise<Ticket> {
    const response = await api.post<Ticket>(`/tickets/${id}/cancel`);
    return response.data;
  }

  async markAsUsed(id: string): Promise<Ticket> {
    const response = await api.post<Ticket>(`/tickets/${id}/use`);
    return response.data;
  }

  async transfer(id: string, newUserId: string): Promise<Ticket> {
    const response = await api.post<Ticket>(`/tickets/${id}/transfer`, { newUserId });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/tickets/${id}`);
  }
}

export default new TicketService();
