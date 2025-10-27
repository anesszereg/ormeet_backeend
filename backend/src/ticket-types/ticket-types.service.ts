import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketType } from '../entities';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto';

@Injectable()
export class TicketTypesService {
  constructor(
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
  ) {}

  async create(createTicketTypeDto: CreateTicketTypeDto): Promise<TicketType> {
    const ticketType = this.ticketTypeRepository.create(createTicketTypeDto);
    return await this.ticketTypeRepository.save(ticketType);
  }

  async findAll(eventId?: string): Promise<TicketType[]> {
    const query = this.ticketTypeRepository.createQueryBuilder('ticketType');

    if (eventId) {
      query.andWhere('ticketType.eventId = :eventId', { eventId });
    }

    query
      .leftJoinAndSelect('ticketType.event', 'event')
      .orderBy('ticketType.price', 'ASC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<TicketType> {
    const ticketType = await this.ticketTypeRepository.findOne({
      where: { id },
      relations: ['event', 'tickets'],
    });

    if (!ticketType) {
      throw new NotFoundException(`Ticket type with ID ${id} not found`);
    }

    return ticketType;
  }

  async findByEvent(eventId: string): Promise<TicketType[]> {
    return await this.ticketTypeRepository.find({
      where: { eventId },
      order: { price: 'ASC' },
    });
  }

  async getAvailableQuantity(id: string): Promise<number> {
    const ticketType = await this.findOne(id);
    return ticketType.quantityTotal - ticketType.quantitySold;
  }

  async isAvailable(id: string): Promise<boolean> {
    const ticketType = await this.findOne(id);
    const now = new Date();

    // Check if sales period is active
    if (ticketType.salesStart && now < ticketType.salesStart) {
      return false;
    }

    if (ticketType.salesEnd && now > ticketType.salesEnd) {
      return false;
    }

    // Check if tickets are available
    const available = await this.getAvailableQuantity(id);
    return available > 0;
  }

  async update(
    id: string,
    updateTicketTypeDto: UpdateTicketTypeDto,
  ): Promise<TicketType> {
    const ticketType = await this.findOne(id);
    Object.assign(ticketType, updateTicketTypeDto);
    return await this.ticketTypeRepository.save(ticketType);
  }

  async remove(id: string): Promise<void> {
    const ticketType = await this.findOne(id);

    // Check if any tickets have been sold
    if (ticketType.tickets && ticketType.tickets.length > 0) {
      throw new BadRequestException(
        'Cannot delete ticket type with sold tickets',
      );
    }

    await this.ticketTypeRepository.remove(ticketType);
  }
}
