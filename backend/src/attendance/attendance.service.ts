import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, Ticket, Event, TicketStatus } from '../entities';
import { CreateAttendanceDto, UpdateAttendanceDto } from './dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    // Verify ticket exists and is active
    const ticket = await this.ticketRepository.findOne({
      where: { id: createAttendanceDto.ticketId },
      relations: ['owner', 'ticketType', 'event'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== TicketStatus.ACTIVE) {
      throw new BadRequestException('Ticket is not active for check-in');
    }

    // Check if already checked in
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        ticketId: createAttendanceDto.ticketId,
        eventId: createAttendanceDto.eventId,
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('Ticket already checked in for this event');
    }

    // Create attendance record
    const attendance = this.attendanceRepository.create({
      ...createAttendanceDto,
      checkedInAt: new Date(),
    });

    const savedAttendance = await this.attendanceRepository.save(attendance);

    // Mark ticket as used
    ticket.status = TicketStatus.USED;
    await this.ticketRepository.save(ticket);

    return savedAttendance;
  }

  async findAll(filters?: {
    eventId?: string;
    ticketId?: string;
  }): Promise<Attendance[]> {
    const query = this.attendanceRepository.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.ticket', 'ticket')
      .leftJoinAndSelect('attendance.event', 'event')
      .leftJoinAndSelect('ticket.owner', 'owner');

    if (filters?.eventId) {
      query.andWhere('attendance.eventId = :eventId', { eventId: filters.eventId });
    }

    if (filters?.ticketId) {
      query.andWhere('attendance.ticketId = :ticketId', { ticketId: filters.ticketId });
    }

    return query.getMany();
  }

  async findByEvent(eventId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { eventId },
      relations: ['ticket', 'ticket.owner'],
      order: { checkedInAt: 'DESC' },
    });
  }

  async findByTicket(ticketId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { ticketId },
      relations: ['event'],
      order: { checkedInAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['ticket', 'event', 'ticket.owner'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);
    Object.assign(attendance, updateAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }

  async getEventAttendanceCount(eventId: string): Promise<number> {
    return this.attendanceRepository.count({
      where: { eventId },
    });
  }

  async getEventAttendanceStats(eventId: string): Promise<{
    totalCheckIns: number;
    averageCheckInTime: string;
  }> {
    const totalCheckIns = await this.attendanceRepository.count({
      where: { eventId },
    });

    return {
      totalCheckIns,
      averageCheckInTime: 'N/A', // Can be calculated if needed
    };
  }
}
