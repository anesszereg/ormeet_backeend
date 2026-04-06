import api from './api';

// ========== Types ==========

export interface Promotion {
  id: string;
  eventId?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  currentUses: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionDto {
  eventId?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {}

export interface ValidationResult {
  valid: boolean;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  message?: string;
}

// ========== Service ==========

class PromotionService {
  async getAll(params?: { eventId?: string; isActive?: boolean }): Promise<Promotion[]> {
    const response = await api.get<Promotion[]>('/promotions', { params });
    return response.data;
  }

  async getById(id: string): Promise<Promotion> {
    const response = await api.get<Promotion>(`/promotions/${id}`);
    return response.data;
  }

  async getByCode(code: string): Promise<Promotion> {
    const response = await api.get<Promotion>(`/promotions/code/${code}`);
    return response.data;
  }

  async validate(code: string): Promise<ValidationResult> {
    const response = await api.post<ValidationResult>(`/promotions/validate/${code}`);
    return response.data;
  }

  async create(data: CreatePromotionDto): Promise<Promotion> {
    const response = await api.post<Promotion>('/promotions', data);
    return response.data;
  }

  async update(id: string, data: UpdatePromotionDto): Promise<Promotion> {
    const response = await api.patch<Promotion>(`/promotions/${id}`, data);
    return response.data;
  }

  async deactivate(id: string): Promise<Promotion> {
    const response = await api.post<Promotion>(`/promotions/${id}/deactivate`);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/promotions/${id}`);
  }
}

export default new PromotionService();
