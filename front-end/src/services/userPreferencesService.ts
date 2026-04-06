import api from './api';
import { Event } from './eventService';

// ========== Types ==========

export interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  logo?: string;
  coverImage?: string;
  createdAt: string;
}

// ========== Service ==========

class UserPreferencesService {
  // ========== Favorite Events ==========

  async getFavoriteEvents(): Promise<Event[]> {
    const response = await api.get<Event[]>('/user-preferences/favorites/events');
    return response.data;
  }

  async addFavoriteEvent(eventId: string): Promise<void> {
    await api.post(`/user-preferences/favorites/events/${eventId}`);
  }

  async removeFavoriteEvent(eventId: string): Promise<void> {
    await api.delete(`/user-preferences/favorites/events/${eventId}`);
  }

  async isFavoriteEvent(eventId: string): Promise<boolean> {
    const response = await api.get<{ isFavorite: boolean }>(`/user-preferences/favorites/events/${eventId}/check`);
    return response.data.isFavorite;
  }

  // ========== Following Organizers ==========

  async getFollowingOrganizers(): Promise<Organization[]> {
    const response = await api.get<Organization[]>('/user-preferences/following/organizers');
    return response.data;
  }

  async followOrganizer(organizerId: string): Promise<void> {
    await api.post(`/user-preferences/following/organizers/${organizerId}`);
  }

  async unfollowOrganizer(organizerId: string): Promise<void> {
    await api.delete(`/user-preferences/following/organizers/${organizerId}`);
  }

  async isFollowingOrganizer(organizerId: string): Promise<boolean> {
    const response = await api.get<{ isFollowing: boolean }>(`/user-preferences/following/organizers/${organizerId}/check`);
    return response.data.isFollowing;
  }

  async getFollowersCount(organizerId: string): Promise<number> {
    const response = await api.get<{ count: number }>(`/user-preferences/organizers/${organizerId}/followers-count`);
    return response.data.count;
  }
}

export default new UserPreferencesService();
