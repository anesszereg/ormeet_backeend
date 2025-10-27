import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../entities';
import { CreateTicketDto, UpdateTicketDto } from './dto';
import * as crypto from 'crypto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    // Generate unique QR code
    const code = this.generateQRCode();

    const ticket = this.ticketRepository.create({
      orderId: createTicketDto.orderId,
      ticketTypeId: createTicketDto.ticketTypeId,
      ownerId: createTicketDto.userId,
      eventId: '', // Will be set from order/ticketType relation
      code,
      seatNumber: createTicketDto.seatNumber,
      status: TicketStatus.ACTIVE,
      issuedAt: new Date(),
    });

    return await this.ticketRepository.save(ticket);
  }

  async findAll(filters?: {
    userId?: string;
    orderId?: string;
    status?: TicketStatus;
  }): Promise<Ticket[]> {
    const query = this.ticketRepository.createQueryBuilder('ticket');

    if (filters?.userId) {
      query.andWhere('ticket.ownerId = :ownerId', { ownerId: filters.userId });
    }

    if (filters?.orderId) {
      query.andWhere('ticket.orderId = :orderId', { orderId: filters.orderId });
    }

    if (filters?.status) {
      query.andWhere('ticket.status = :status', { status: filters.status });
    }

    query
      .leftJoinAndSelect('ticket.owner', 'owner')
      .leftJoinAndSelect('ticket.order', 'order')
      .leftJoinAndSelect('ticket.ticketType', 'ticketType')
      .orderBy('ticket.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['owner', 'order', 'ticketType', 'attendances'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async findByQRCode(code: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { code },
      relations: ['owner', 'order', 'ticketType', 'attendances'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with code ${code} not found`);
    }

    return ticket;
  }

  async findByUser(userId: string): Promise<Ticket[]> {
    return await this.ticketRepository.find({
      where: { ownerId: userId },
      relations: ['order', 'ticketType'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);
    Object.assign(ticket, updateTicketDto);
    return await this.ticketRepository.save(ticket);
  }

  async cancel(id: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.status === TicketStatus.USED) {
      throw new BadRequestException('Cannot cancel a used ticket');
    }

    ticket.status = TicketStatus.CANCELLED;
    return await this.ticketRepository.save(ticket);
  }

  async markAsUsed(id: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.status !== TicketStatus.ACTIVE) {
      throw new BadRequestException('Only active tickets can be used');
    }

    ticket.status = TicketStatus.USED;
    return await this.ticketRepository.save(ticket);
  }

  async transfer(id: string, newUserId: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.status !== TicketStatus.ACTIVE) {
      throw new BadRequestException('Only active tickets can be transferred');
    }

    ticket.ownerId = newUserId;
    return await this.ticketRepository.save(ticket);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);

    if (ticket.status === TicketStatus.USED) {
      throw new BadRequestException('Cannot delete a used ticket');
    }

    await this.ticketRepository.remove(ticket);
  }

  // Helper method to generate unique QR code
  private generateQRCode(): string {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }
}
