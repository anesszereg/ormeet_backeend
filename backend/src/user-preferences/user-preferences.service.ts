import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFavoriteEvent, UserFollowingOrganizer, Event, Organization } from '../entities';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(UserFavoriteEvent)
    private readonly favoriteEventRepository: Repository<UserFavoriteEvent>,
    @InjectRepository(UserFollowingOrganizer)
    private readonly followingOrganizerRepository: Repository<UserFollowingOrganizer>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  // ========== Favorite Events ==========

  async addFavoriteEvent(userId: string, eventId: string): Promise<UserFavoriteEvent> {
    // Check if event exists
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if already favorited
    const existing = await this.favoriteEventRepository.findOne({
      where: { userId, eventId },
    });
    if (existing) {
      throw new ConflictException('Event already in favorites');
    }

    const favorite = this.favoriteEventRepository.create({ userId, eventId });
    return await this.favoriteEventRepository.save(favorite);
  }

  async removeFavoriteEvent(userId: string, eventId: string): Promise<void> {
    const favorite = await this.favoriteEventRepository.findOne({
      where: { userId, eventId },
    });
    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }
    await this.favoriteEventRepository.remove(favorite);
  }

  async getFavoriteEvents(userId: string): Promise<Event[]> {
    const favorites = await this.favoriteEventRepository.find({
      where: { userId },
      relations: ['event', 'event.venue', 'event.organizer', 'event.ticketTypes'],
      order: { createdAt: 'DESC' },
    });
    return favorites.map(f => f.event);
  }

  async isFavoriteEvent(userId: string, eventId: string): Promise<boolean> {
    const favorite = await this.favoriteEventRepository.findOne({
      where: { userId, eventId },
    });
    return !!favorite;
  }

  // ========== Following Organizers ==========

  async followOrganizer(userId: string, organizerId: string): Promise<UserFollowingOrganizer> {
    // Check if organizer exists
    const organizer = await this.organizationRepository.findOne({ where: { id: organizerId } });
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }

    // Check if already following
    const existing = await this.followingOrganizerRepository.findOne({
      where: { userId, organizerId },
    });
    if (existing) {
      throw new ConflictException('Already following this organizer');
    }

    const following = this.followingOrganizerRepository.create({ userId, organizerId });
    return await this.followingOrganizerRepository.save(following);
  }

  async unfollowOrganizer(userId: string, organizerId: string): Promise<void> {
    const following = await this.followingOrganizerRepository.findOne({
      where: { userId, organizerId },
    });
    if (!following) {
      throw new NotFoundException('Not following this organizer');
    }
    await this.followingOrganizerRepository.remove(following);
  }

  async getFollowingOrganizers(userId: string): Promise<Organization[]> {
    const following = await this.followingOrganizerRepository.find({
      where: { userId },
      relations: ['organizer'],
      order: { createdAt: 'DESC' },
    });
    return following.map(f => f.organizer);
  }

  async isFollowingOrganizer(userId: string, organizerId: string): Promise<boolean> {
    const following = await this.followingOrganizerRepository.findOne({
      where: { userId, organizerId },
    });
    return !!following;
  }

  async getFollowersCount(organizerId: string): Promise<number> {
    return await this.followingOrganizerRepository.count({
      where: { organizerId },
    });
  }
}
