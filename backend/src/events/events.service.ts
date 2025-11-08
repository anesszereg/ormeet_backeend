import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus, EventDateType, LocationType, TicketType } from '../entities';
import { CreateEventDto, UpdateEventDto, CreateEventEnhancedDto } from './dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
  ) {}

  // Legacy method - kept for backward compatibility
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

  // Enhanced event creation with validation
  async createEnhanced(createEventDto: CreateEventEnhancedDto): Promise<Event> {
    // Validate date type and recurring fields
    if (createEventDto.dateType === EventDateType.MULTIPLE) {
      if (!createEventDto.recurringPattern || !createEventDto.recurringCount) {
        throw new BadRequestException(
          'Recurring pattern and count are required for multiple date type events',
        );
      }
    }

    // Validate location type and required fields
    if (createEventDto.locationType === LocationType.PHYSICAL) {
      if (!createEventDto.venueId && !createEventDto.customLocation) {
        throw new BadRequestException(
          'Either venueId or customLocation is required for physical events',
        );
      }
    }

    if (createEventDto.locationType === LocationType.ONLINE) {
      if (!createEventDto.onlineLink) {
        throw new BadRequestException(
          'Online link is required for online events',
        );
      }
    }

    // Map DTO to entity (handle field name differences)
    const event = this.eventRepository.create({
      title: createEventDto.title,
      shortDescription: createEventDto.shortDescription,
      longDescription: createEventDto.longDescription,
      organizerId: createEventDto.organizerId,
      status: createEventDto.status || EventStatus.DRAFT,
      category: createEventDto.type, // Map 'type' to 'category'
      tags: createEventDto.tags,
      images: createEventDto.images,
      videos: createEventDto.videos,
      
      // Date configuration
      dateType: createEventDto.dateType,
      startAt: createEventDto.startAt,
      endAt: createEventDto.endAt,
      timezone: createEventDto.timezone || 'UTC',
      recurringPattern: createEventDto.recurringPattern,
      recurringCount: createEventDto.recurringCount,
      recurringEndDate: createEventDto.recurringEndDate,
      
      // Location configuration
      locationType: createEventDto.locationType,
      venueId: createEventDto.venueId,
      customLocation: createEventDto.customLocation,
      onlineLink: createEventDto.onlineLink,
      onlineInstructions: createEventDto.onlineInstructions,
      
      capacity: createEventDto.capacity,
      guidelines: createEventDto.guidelines,
      
      // Participants
      speakers: createEventDto.speakers,
      performers: createEventDto.performers,
      sponsors: createEventDto.sponsors,
    });

    const savedEvent = await this.eventRepository.save(event);

    // Create tickets if provided
    if (createEventDto.tickets && createEventDto.tickets.length > 0) {
      const tickets = createEventDto.tickets.map((ticketDto) => {
        return this.ticketTypeRepository.create({
          eventId: savedEvent.id,
          title: ticketDto.name,
          type: ticketDto.type,
          description: ticketDto.description,
          price: ticketDto.price,
          currency: ticketDto.currency || 'USD',
          quantityTotal: ticketDto.quantityTotal,
          quantitySold: 0,
          maxPerOrder: ticketDto.maxPerOrder,
          ticketBenefits: ticketDto.ticketBenefits,
          salesStart: ticketDto.salesStart,
          salesEnd: ticketDto.salesEnd,
          isVisible: ticketDto.isVisible !== undefined ? ticketDto.isVisible : true,
          isFree: ticketDto.isFree || false,
        });
      });

      await this.ticketTypeRepository.save(tickets);
    }

    // Return event with tickets
    const eventWithRelations = await this.eventRepository.findOne({
      where: { id: savedEvent.id },
      relations: ['ticketTypes', 'organizer', 'venue'],
    });

    if (!eventWithRelations) {
      throw new NotFoundException('Event not found after creation');
    }

    return eventWithRelations;
  }
}
