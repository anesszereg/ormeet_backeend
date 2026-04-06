import api from './api';

// ========== Types ==========

export interface OrderItem {
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
}

export interface BillingAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderDto {
  userId: string;
  eventId: string;
  items: OrderItem[];
  billingName: string;
  billingEmail: string;
  billingAddress: BillingAddress;
  customerPhone?: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash' | 'free';
  paymentProvider?: string;
  discountCode?: string;
  customerNotes?: string;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  items: OrderItem[];
  amountSubtotal: number;
  discountAmount?: number;
  serviceFee?: number;
  processingFee?: number;
  amountTotal: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  billingName?: string;
  billingEmail?: string;
  customerNotes?: string;
  paidAt?: string;
  refundedAt?: string;
  providerPaymentId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  };
  event?: {
    id: string;
    title: string;
    startAt: string;
    endAt: string;
    images?: string[];
  };
  tickets?: Array<{
    id: string;
    code: string;
    status: string;
    ticketType?: {
      title: string;
      type: string;
    };
  }>;
}

export interface UpdateOrderDto {
  billingName?: string;
  billingEmail?: string;
  customerNotes?: string;
}

// ========== Service ==========

class OrderService {
  async create(data: CreateOrderDto): Promise<Order> {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  }

  async getAll(params?: { userId?: string; eventId?: string; status?: string }): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders', { params });
    return response.data;
  }

  async getById(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  }

  async getByUser(userId: string): Promise<Order[]> {
    const response = await api.get<Order[]>(`/orders/user/${userId}`);
    return response.data;
  }

  async update(id: string, data: UpdateOrderDto): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}`, data);
    return response.data;
  }

  async completePayment(id: string, providerPaymentId?: string): Promise<Order> {
    const response = await api.post<Order>(`/orders/${id}/complete-payment`, { providerPaymentId });
    return response.data;
  }

  async refund(id: string, refundAmount?: number): Promise<Order> {
    const response = await api.post<Order>(`/orders/${id}/refund`, { refundAmount });
    return response.data;
  }

  async cancel(id: string): Promise<Order> {
    const response = await api.post<Order>(`/orders/${id}/cancel`);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/orders/${id}`);
  }
}

export default new OrderService();
