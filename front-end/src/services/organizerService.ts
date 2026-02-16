import api from './api';

// ========== Event Types ==========

export interface EventParticipant {
  name: string;
  role: string;
  bio?: string;
  image?: string;
}

export interface EventGuidelines {
  ageRequirement?: string;
  refundPolicy?: string;
  parkingInfo?: string;
  accessibilityInfo?: string;
  dresscode?: string;
  additionalInfo?: string;
}

export interface TicketTypeDto {
  name: string;
  type: 'general' | 'vip' | 'early_bird' | 'student' | 'group' | 'premium';
  quantityTotal: number;
  price: number;
  maxPerOrder?: number;
  ticketBenefits?: string[];
  description?: string;
  salesStartAt?: string;
  salesEndAt?: string;
}

export interface CustomLocation {
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  postalCode?: string;
  country: string;
}

export interface CreateEventDto {
  title: string;
  type: string;
  shortDescription: string;
  longDescription?: string;
  organizerId: string;
  status?: 'draft' | 'published' | 'cancelled';
  dateType: 'one_time' | 'multiple';
  tags?: string[];
  images?: string[];
  venueId?: string;
  startAt: string;
  endAt: string;
  timezone?: string;
  locationType: 'physical' | 'online' | 'tba';
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
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurringCount?: number;
  capacity?: number;
  ageLimit?: number;
  allowReentry?: boolean;
  refundsAllowed?: boolean;
  tickets?: TicketTypeDto[];
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface TicketTypeInfo {
  id: string;
  name: string;
  type: string;
  price: number;
  quantityTotal: number;
  quantitySold: number;
}

export interface Event {
  id: string;
  title: string;
  type?: string;
  shortDescription?: string;
  description?: string;
  organizerId: string;
  dateType: string;
  startAt: string;
  endAt: string;
  locationType: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  images?: string[];
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
  ticketTypes?: TicketTypeInfo[];
}

// ========== Order Types ==========

export interface OrderItem {
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderId?: string;
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
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  };
  event?: Event;
}

// ========== Attendance Types ==========

export interface Attendee {
  id: string;
  ticketId: string;
  eventId: string;
  checkedInAt: string;
  method?: string;
  ticket?: {
    code: string;
    owner?: {
      id: string;
      name: string;
      email: string;
      profilePhoto?: string;
    };
    ticketType?: {
      name: string;
      type: string;
    };
  };
}

export interface CheckInDto {
  ticketCode?: string;
  ticketId?: string;
  eventId?: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  attendee?: {
    name: string;
    email: string;
    ticketType: string;
    ticketCode: string;
  };
  checkedInAt?: string;
  alreadyCheckedIn?: boolean;
  previousCheckInTime?: string;
}

export interface AttendanceStats {
  totalCheckIns: number;
  averageCheckInTime?: string;
}

// ========== Organization Types ==========

export interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  ownerId: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  ownerId: string;
  settings?: Record<string, any>;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  settings?: Record<string, any>;
}

// ========== Dashboard Stats Types ==========

export interface DashboardStats {
  totalEvents: number;
  totalOrders: number;
  totalRevenue: number;
  totalAttendees: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    profilePhoto?: string;
  };
}

// ========== Service Class ==========

class OrganizerService {
  // ========== Events ==========

  async getEvents(params?: {
    status?: string;
    category?: string;
    organizerId?: string;
  }): Promise<Event[]> {
    const response = await api.get<Event[]>('/events', { params });
    return response.data;
  }

  async getEventById(id: string): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  }

  async createEvent(data: CreateEventDto): Promise<Event> {
    const response = await api.post<Event>('/events', data);
    return response.data;
  }

  async updateEvent(id: string, data: UpdateEventDto): Promise<Event> {
    const response = await api.patch<Event>(`/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  }

  async publishEvent(id: string): Promise<Event> {
    const response = await api.post<Event>(`/events/${id}/publish`);
    return response.data;
  }

  async cancelEvent(id: string): Promise<Event> {
    const response = await api.post<Event>(`/events/${id}/cancel`);
    return response.data;
  }

  // ========== Upload ==========

  async uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await api.post<{ urls: string[] }>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.urls;
  }

  // ========== Orders ==========

  async getOrders(params?: {
    userId?: string;
    eventId?: string;
    status?: string;
  }): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders', { params });
    return response.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  }

  async getOrdersByEvent(eventId: string): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders', { params: { eventId } });
    return response.data;
  }

  async refundOrder(id: string, refundAmount?: number): Promise<Order> {
    const response = await api.post<Order>(`/orders/${id}/refund`, { refundAmount });
    return response.data;
  }

  async cancelOrder(id: string): Promise<Order> {
    const response = await api.post<Order>(`/orders/${id}/cancel`);
    return response.data;
  }

  async deleteOrder(id: string): Promise<void> {
    await api.delete(`/orders/${id}`);
  }

  // ========== Attendance ==========

  async getAttendees(params?: {
    eventId?: string;
    ticketId?: string;
  }): Promise<Attendee[]> {
    const response = await api.get<Attendee[]>('/attendance', { params });
    return response.data;
  }

  async getAttendeesByEvent(eventId: string): Promise<Attendee[]> {
    const response = await api.get<Attendee[]>(`/attendance/event/${eventId}`);
    return response.data;
  }

  async getAttendanceCount(eventId: string): Promise<number> {
    const response = await api.get<number>(`/attendance/event/${eventId}/count`);
    return response.data;
  }

  async getAttendanceStats(eventId: string): Promise<AttendanceStats> {
    const response = await api.get<AttendanceStats>(`/attendance/event/${eventId}/stats`);
    return response.data;
  }

  async checkInAttendee(data: CheckInDto): Promise<CheckInResponse> {
    const response = await api.post<CheckInResponse>('/attendance/check-in', data);
    return response.data;
  }

  async validateTicket(ticketCode: string, eventId: string): Promise<CheckInResponse> {
    const response = await api.get<CheckInResponse>(`/attendance/validate/${ticketCode}/${eventId}`);
    return response.data;
  }

  // ========== Organizations ==========

  async getOrganizations(): Promise<Organization[]> {
    const response = await api.get<Organization[]>('/organizations');
    return response.data;
  }

  async getOrganizationById(id: string): Promise<Organization> {
    const response = await api.get<Organization>(`/organizations/${id}`);
    return response.data;
  }

  async getOrganizationsByOwner(ownerId: string): Promise<Organization[]> {
    const response = await api.get<Organization[]>(`/organizations/owner/${ownerId}`);
    return response.data;
  }

  async createOrganization(data: CreateOrganizationDto): Promise<Organization> {
    const response = await api.post<Organization>('/organizations', data);
    return response.data;
  }

  async updateOrganization(id: string, data: UpdateOrganizationDto): Promise<Organization> {
    const response = await api.patch<Organization>(`/organizations/${id}`, data);
    return response.data;
  }

  async deleteOrganization(id: string): Promise<void> {
    await api.delete(`/organizations/${id}`);
  }

  async addOrganizationMember(orgId: string, userId: string, role: string): Promise<void> {
    await api.post(`/organizations/${orgId}/members/${userId}/${role}`);
  }

  async removeOrganizationMember(orgId: string, userId: string): Promise<void> {
    await api.delete(`/organizations/${orgId}/members/${userId}`);
  }

  async updateMemberRole(orgId: string, userId: string, role: string): Promise<void> {
    await api.patch(`/organizations/${orgId}/members/${userId}/role`, { role });
  }

  // ========== Team Invites ==========

  async inviteTeamMember(orgId: string, data: { email: string; role: string; message?: string }): Promise<{ inviteCode: string; email: string }> {
    const response = await api.post<{ inviteCode: string; email: string }>(`/organizations/${orgId}/invite`, data);
    return response.data;
  }

  async getPendingInvites(orgId: string): Promise<any[]> {
    const response = await api.get<any[]>(`/organizations/${orgId}/invites`);
    return response.data;
  }

  async cancelInvite(orgId: string, inviteId: string): Promise<void> {
    await api.delete(`/organizations/${orgId}/invites/${inviteId}`);
  }

  // ========== Custom Roles ==========

  async getCustomRoles(orgId: string): Promise<any[]> {
    const response = await api.get<any[]>(`/organizations/${orgId}/roles`);
    return response.data;
  }

  async createCustomRole(orgId: string, data: { name: string; permissions: Record<string, Record<string, boolean>> }): Promise<any> {
    const response = await api.post<any>(`/organizations/${orgId}/roles`, data);
    return response.data;
  }

  async updateCustomRole(orgId: string, roleId: string, data: { name?: string; permissions?: Record<string, Record<string, boolean>> }): Promise<any> {
    const response = await api.patch<any>(`/organizations/${orgId}/roles/${roleId}`, data);
    return response.data;
  }

  async deleteCustomRole(orgId: string, roleId: string): Promise<void> {
    await api.delete(`/organizations/${orgId}/roles/${roleId}`);
  }

  // ========== Dashboard Stats (Computed from other endpoints) ==========

  async getDashboardStats(organizerId: string): Promise<DashboardStats> {
    const [events, orders] = await Promise.all([
      this.getEvents({ organizerId }),
      this.getOrders(),
    ]);

    // Filter orders for organizer's events
    const eventIds = new Set(events.map(e => e.id));
    const organizerOrders = orders.filter(o => eventIds.has(o.eventId));

    const totalRevenue = organizerOrders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + o.amountTotal, 0);

    return {
      totalEvents: events.length,
      totalOrders: organizerOrders.length,
      totalRevenue,
      totalAttendees: 0, // Would need to aggregate from attendance
      recentActivities: [], // Would need a dedicated endpoint
    };
  }
}

export default new OrganizerService();
