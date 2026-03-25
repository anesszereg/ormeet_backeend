import api from './api';

// ========== Types ==========

export interface Review {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  comment?: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    profilePhoto?: string;
  };
  event?: {
    id: string;
    title: string;
  };
}

export interface CreateReviewDto {
  eventId: string;
  userId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

export interface AverageRating {
  average: number;
  count: number;
}

// ========== Service ==========

class ReviewService {
  async getAll(params?: { eventId?: string; userId?: string; approved?: boolean }): Promise<Review[]> {
    const response = await api.get<Review[]>('/reviews', { params });
    return response.data;
  }

  async getByEvent(eventId: string): Promise<Review[]> {
    const response = await api.get<Review[]>(`/reviews/event/${eventId}`);
    return response.data;
  }

  async getEventAverageRating(eventId: string): Promise<AverageRating> {
    const response = await api.get<AverageRating>(`/reviews/event/${eventId}/average`);
    return response.data;
  }

  async getById(id: string): Promise<Review> {
    const response = await api.get<Review>(`/reviews/${id}`);
    return response.data;
  }

  async create(data: CreateReviewDto): Promise<Review> {
    const response = await api.post<Review>('/reviews', data);
    return response.data;
  }

  async update(id: string, data: UpdateReviewDto): Promise<Review> {
    const response = await api.patch<Review>(`/reviews/${id}`, data);
    return response.data;
  }

  async approve(id: string): Promise<Review> {
    const response = await api.post<Review>(`/reviews/${id}/approve`);
    return response.data;
  }

  async reject(id: string): Promise<Review> {
    const response = await api.post<Review>(`/reviews/${id}/reject`);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/reviews/${id}`);
  }
}

export default new ReviewService();
