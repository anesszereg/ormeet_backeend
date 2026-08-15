import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import {
  Event,
  EventStatus,
  EventDateType,
  LocationType,
  EventVisibility,
  TicketType,
  Order,
} from "../entities";
import { CreateEventDto, UpdateEventDto, CreateEventEnhancedDto } from "./dto";
import { EmailService } from "../email/email.service";

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly emailService: EmailService,
  ) {}

  // Legacy method - kept for backward compatibility
  async create(createEventDto: CreateEventDto): Promise<Event> {
    const { tickets: _tickets, ...eventData } = createEventDto;
    const event = this.eventRepository.create({
      ...eventData,
      status: createEventDto.status || EventStatus.DRAFT,
      visibility: createEventDto.visibility || EventVisibility.PUBLIC,
    } as Event);

    return await this.eventRepository.save(event);
  }

  async findAll(filters?: {
    status?: EventStatus;
    category?: string;
    organizerId?: string;
  }): Promise<Event[]> {
    const query = this.eventRepository.createQueryBuilder("event");

    if (filters?.status) {
      query.andWhere("event.status = :status", { status: filters.status });
    }

    if (filters?.category) {
      query.andWhere("event.category = :category", {
        category: filters.category,
      });
    }

    if (filters?.organizerId) {
      query.andWhere("event.organizerId = :organizerId", {
        organizerId: filters.organizerId,
      });
    } else if (filters?.status === EventStatus.PUBLISHED) {
      // Public listings only show public events; private events are accessible via direct link.
      query.andWhere("event.visibility = :visibility", {
        visibility: EventVisibility.PUBLIC,
      });
    }

    query
      .leftJoinAndSelect("event.organizer", "organizer")
      .leftJoinAndSelect("event.venue", "venue")
      .leftJoinAndSelect("event.ticketTypes", "ticketTypes")
      .orderBy("event.startAt", "ASC");

    return await query.getMany();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ["organizer", "venue", "ticketTypes"],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    const { tickets, ...eventUpdates } = updateEventDto as Partial<UpdateEventDto>;
    Object.assign(event, eventUpdates);

    const savedEvent = await this.eventRepository.save(event);

    // Replace ticket types when editing tickets.
    // Ticket types that already have sold tickets are protected by a
    // foreign key (tickets.ticket_type_id) — deleting them would throw an
    // uncaught DB error (500). Only remove/recreate the ones that have no
    // sales yet; leave already-sold ticket types untouched.
    if (tickets && Array.isArray(tickets)) {
      const existingTicketTypes = await this.ticketTypeRepository.find({
        where: { eventId: id },
      });
      const deletableIds = existingTicketTypes
        .filter((tt) => tt.quantitySold === 0)
        .map((tt) => tt.id);

      if (deletableIds.length > 0) {
        await this.ticketTypeRepository.delete({ id: In(deletableIds) });
      }

      if (tickets.length > 0) {
        const newTickets = tickets.map((ticketDto) =>
          this.ticketTypeRepository.create({
            eventId: savedEvent.id,
            title: ticketDto.name,
            type: ticketDto.type,
            description: ticketDto.description,
            price: ticketDto.price,
            currency: ticketDto.currency || "DZD",
            quantityTotal: ticketDto.quantityTotal,
            quantitySold: 0,
            maxPerOrder: ticketDto.maxPerOrder,
            ticketBenefits: ticketDto.ticketBenefits,
            salesStart: ticketDto.salesStart,
            salesEnd: ticketDto.salesEnd,
            isVisible:
              ticketDto.isVisible !== undefined ? ticketDto.isVisible : true,
            isFree: ticketDto.isFree || false,
          }),
        );
        await this.ticketTypeRepository.save(newTickets);
      }
    }

    // Return event with relations
    const eventWithRelations = await this.eventRepository.findOne({
      where: { id: savedEvent.id },
      relations: ["ticketTypes", "organizer", "venue"],
    });

    if (!eventWithRelations) {
      throw new NotFoundException("Event not found after update");
    }

    return eventWithRelations;
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }

  async publish(id: string): Promise<Event> {
    const event = await this.findOne(id);

    if (event.status === EventStatus.PUBLISHED) {
      throw new BadRequestException("Event is already published");
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
    await this.eventRepository.increment({ id }, "views", 1);
  }

  async incrementFavorites(id: string): Promise<void> {
    await this.eventRepository.increment({ id }, "favorites", 1);
  }

  // Enhanced event creation with validation
  async createEnhanced(createEventDto: CreateEventEnhancedDto): Promise<Event> {
    // Validate date type and recurring fields
    if (createEventDto.dateType === EventDateType.MULTIPLE) {
      if (!createEventDto.recurringPattern || !createEventDto.recurringCount) {
        throw new BadRequestException(
          "Recurring pattern and count are required for multiple date type events",
        );
      }
    }

    // Validate location type and required fields
    if (createEventDto.locationType === LocationType.PHYSICAL) {
      if (!createEventDto.venueId && !createEventDto.customLocation) {
        throw new BadRequestException(
          "Either venueId or customLocation is required for physical events",
        );
      }
    }

    if (createEventDto.locationType === LocationType.ONLINE) {
      if (!createEventDto.onlineLink) {
        throw new BadRequestException(
          "Online link is required for online events",
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
      // `type` is a free-form, organizer-supplied label (e.g. "Music" or
      // a custom value like "Open-mic night") that we persist as the
      // event's category column.
      category: createEventDto.type,
      tags: createEventDto.tags,
      images: createEventDto.images,
      videos: createEventDto.videos,

      // Date configuration
      dateType: createEventDto.dateType,
      startAt: createEventDto.startAt,
      endAt: createEventDto.endAt,
      timezone: createEventDto.timezone || "UTC",
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
      requiresApproval: createEventDto.requiresApproval,
      visibility: createEventDto.visibility || EventVisibility.PUBLIC,
      invitedEmails: createEventDto.invitedEmails,

      // Participants
      speakers: createEventDto.speakers,
      performers: createEventDto.performers,
      sponsors: createEventDto.sponsors,

      // Sessions
      sessions: createEventDto.sessions,
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
          currency: ticketDto.currency || "DZD",
          quantityTotal: ticketDto.quantityTotal,
          quantitySold: 0,
          maxPerOrder: ticketDto.maxPerOrder,
          ticketBenefits: ticketDto.ticketBenefits,
          salesStart: ticketDto.salesStart,
          salesEnd: ticketDto.salesEnd,
          isVisible:
            ticketDto.isVisible !== undefined ? ticketDto.isVisible : true,
          isFree: ticketDto.isFree || false,
        });
      });

      await this.ticketTypeRepository.save(tickets);
    }

    // Send invitation emails for private events
    const failedInvitations: string[] = [];
    if (
      savedEvent.visibility === EventVisibility.PRIVATE &&
      createEventDto.invitedEmails &&
      createEventDto.invitedEmails.length > 0
    ) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const eventUrl = `${frontendUrl}/event/${savedEvent.id}`;

      for (const email of createEventDto.invitedEmails) {
        try {
          await this.emailService.sendPrivateEventInvitation({
            email,
            eventName: savedEvent.title,
            eventDate: new Date(savedEvent.startAt).toLocaleDateString(),
            eventLocation:
              savedEvent.locationType === LocationType.ONLINE
                ? "Online Event"
                : savedEvent.customLocation?.address || "TBA",
            organizerName: savedEvent.organizer?.name || "Event Organizer",
            eventUrl,
          });
        } catch (error) {
          // Track failed invitations and continue with others
          this.logger.warn(`Failed to send invitation to ${email}:`, error);
          failedInvitations.push(email);
        }
      }
    }

    // Return event with tickets
    const eventWithRelations = await this.eventRepository.findOne({
      where: { id: savedEvent.id },
      relations: ["ticketTypes", "organizer", "venue"],
    });

    // Add failed invitations to the response
    if (failedInvitations.length > 0) {
      (eventWithRelations as any).failedInvitations = failedInvitations;
    }

    if (!eventWithRelations) {
      throw new NotFoundException("Event not found after creation");
    }

    return eventWithRelations;
  }

  async getParticipantEmailsFromAllEvents(organizerId: string): Promise<string[]> {
    // Get all events by this organizer
    const events = await this.eventRepository.find({
      where: { organizerId },
      select: ["id"],
    });

    if (events.length === 0) {
      return [];
    }

    const eventIds = events.map((e) => e.id);

    // Get all orders for these events
    const orders = await this.orderRepository.find({
      where: { eventId: In(eventIds) },
      relations: ["user"],
    });

    // Extract unique emails
    const uniqueEmails = new Set<string>();
    for (const order of orders) {
      if (order.user?.email) {
        uniqueEmails.add(order.user.email);
      }
    }

    return Array.from(uniqueEmails);
  }
}
