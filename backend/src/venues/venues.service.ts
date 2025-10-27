import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from '../entities';
import { CreateVenueDto, UpdateVenueDto } from './dto';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
  ) {}

  async create(createVenueDto: CreateVenueDto): Promise<Venue> {
    const venue = this.venueRepository.create(createVenueDto);
    return await this.venueRepository.save(venue);
  }

  async findAll(filters?: {
    city?: string;
    country?: string;
    minCapacity?: number;
  }): Promise<Venue[]> {
    const query = this.venueRepository.createQueryBuilder('venue');

    if (filters?.city) {
      query.andWhere('venue.city = :city', { city: filters.city });
    }

    if (filters?.country) {
      query.andWhere('venue.country = :country', { country: filters.country });
    }

    if (filters?.minCapacity) {
      query.andWhere('venue.capacity >= :minCapacity', {
        minCapacity: filters.minCapacity,
      });
    }

    query.orderBy('venue.name', 'ASC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Venue> {
    const venue = await this.venueRepository.findOne({
      where: { id },
      relations: ['events'],
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    return venue;
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
  ): Promise<Venue[]> {
    // Haversine formula for finding nearby venues
    // This is a simplified version - for production, consider using PostGIS
    const venues = await this.venueRepository.find();

    return venues.filter((venue) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        venue.latitude,
        venue.longitude,
      );
      return distance <= radiusKm;
    });
  }

  async update(id: string, updateVenueDto: UpdateVenueDto): Promise<Venue> {
    const venue = await this.findOne(id);
    Object.assign(venue, updateVenueDto);
    return await this.venueRepository.save(venue);
  }

  async remove(id: string): Promise<void> {
    const venue = await this.findOne(id);
    await this.venueRepository.remove(venue);
  }

  // Helper method to calculate distance between two coordinates
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
