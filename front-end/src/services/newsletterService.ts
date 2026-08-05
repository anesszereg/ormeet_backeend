import api from './api';

export interface SubscribeNewsletterDto {
  email: string;
  locale?: string;
}

export interface SubscribeNewsletterResponse {
  message: string;
}

class NewsletterService {
  async subscribe(data: SubscribeNewsletterDto): Promise<SubscribeNewsletterResponse> {
    const response = await api.post<SubscribeNewsletterResponse>('/newsletter/subscribe', data);
    return response.data;
  }
}

export default new NewsletterService();
