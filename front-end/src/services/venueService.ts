import api from './api';

// ========== Types ==========

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVenueDto {
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
}

export interface UpdateVenueDto extends Partial<CreateVenueDto> {}

// ========== Service ==========

class VenueService {
  async getAll(params?: { city?: string; country?: string; minCapacity?: number }): Promise<Venue[]> {
    const response = await api.get<Venue[]>('/venues', { params });
    return response.data;
  }

  async getNearby(latitude: number, longitude: number, radius?: number): Promise<Venue[]> {
    const response = await api.get<Venue[]>('/venues/nearby', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  }

  async getById(id: string): Promise<Venue> {
    const response = await api.get<Venue>(`/venues/${id}`);
    return response.data;
  }

  async create(data: CreateVenueDto): Promise<Venue> {
    const response = await api.post<Venue>('/venues', data);
    return response.data;
  }

  async update(id: string, data: UpdateVenueDto): Promise<Venue> {
    const response = await api.patch<Venue>(`/venues/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/venues/${id}`);
  }
}

export default new VenueService();
