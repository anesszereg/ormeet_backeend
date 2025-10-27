import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from '../entities';
import { CreateEventDto, UpdateEventDto } from './dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      ...createEventDto,
      status: createEventDto.status || EventStatus.DRAFT,
    });

    return await this.eventRepository.save(event);
  }

  async findAll(filters?: {
    status?: EventStatus;
    category?: string;
    organizerId?: string;
  }): Promise<Event[]> {
    const query = this.eventRepository.createQueryBuilder('event');

    if (filters?.status) {
      query.andWhere('event.status = :status', { status: filters.status });
    }

    if (filters?.category) {
      query.andWhere('event.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.organizerId) {
      query.andWhere('event.organizerId = :organizerId', {
        organizerId: filters.organizerId,
      });
    }

    query
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.venue', 'venue')
      .orderBy('event.startAt', 'ASC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer', 'venue', 'ticketTypes'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    Object.assign(event, updateEventDto);

    return await this.eventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }

  async publish(id: string): Promise<Event> {
    const event = await this.findOne(id);

    if (event.status === EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is already published');
    }

    event.status = EventStatus.PUBLISHED;
    event.publishedAt = new Date();

    return await this.eventRepository.save(event);
  }

  async cancel(id: string): Promise<Event> {
    const event = await this.findOne(id);

    event.status = EventStatus.CANCELLED;

    return await this.eventRepository.save(event);
  }

  async incrementViews(id: string): Promise<void> {
    await this.eventRepository.increment({ id }, 'views', 1);
  }

  async incrementFavorites(id: string): Promise<void> {
    await this.eventRepository.increment({ id }, 'favorites', 1);
  }
}
