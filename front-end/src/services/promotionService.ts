import api from './api';

// ========== Types ==========

export type PromotionType = 'percent' | 'fixed' | 'free-ticket';

export interface Promotion {
  id: string;
  eventId?: string;
  code: string;
  description?: string;
  type: PromotionType;
  value: number;
  discountPercentage?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionDto {
  eventId?: string;
  code: string;
  description?: string;
  type: PromotionType;
  value: number;
  maxUses?: number;
  validFrom: string;
  validUntil: string;
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {
  isActive?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  discountType?: PromotionType;
  discountValue?: number;
  message?: string;
  promotion?: Promotion;
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

  async validate(code: string, eventId?: string): Promise<ValidationResult> {
    const response = await api.post<ValidationResult>(
      `/promotions/validate/${code}`,
      undefined,
      { params: eventId ? { eventId } : undefined },
    );
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
