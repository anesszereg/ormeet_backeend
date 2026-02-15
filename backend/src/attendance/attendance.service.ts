import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, Ticket, Event, TicketStatus, CheckInMethod } from '../entities';
import { CreateAttendanceDto, UpdateAttendanceDto, CheckInDto } from './dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private emailService: EmailService,
  ) {}

  /**
   * Check-in a ticket by scanning QR code or manual entry
   */
  async checkIn(checkInDto: CheckInDto): Promise<{
    success: boolean;
    message: string;
    attendance?: Attendance;
    ticketInfo?: {
      ticketType: string;
      ownerName: string;
      eventTitle: string;
    };
  }> {
    // Validate that either ticketCode or ticketId is provided
    if (!checkInDto.ticketCode && !checkInDto.ticketId) {
      return {
        success: false,
        message: 'Either ticketCode or ticketId must be provided',
      };
    }

    // Find ticket by code or ID
    const whereCondition = checkInDto.ticketId 
      ? { id: checkInDto.ticketId }
      : { code: checkInDto.ticketCode };

    const ticket = await this.ticketRepository.findOne({
      where: whereCondition,
      relations: ['owner', 'ticketType', 'event', 'order'],
    });

    if (!ticket) {
      return {
        success: false,
        message: checkInDto.ticketId ? 'Invalid ticket ID' : 'Invalid ticket code',
      };
    }

    // Use the ticket's eventId if not provided in the request
    const eventId = checkInDto.eventId || ticket.eventId;

    // Verify ticket belongs to the event (if eventId was provided)
    if (checkInDto.eventId && ticket.eventId !== checkInDto.eventId) {
      return {
        success: false,
        message: 'This ticket is not valid for this event',
      };
    }

    // Check ticket status
    if (ticket.status === TicketStatus.CANCELLED) {
      return {
        success: false,
        message: 'This ticket has been cancelled',
      };
    }


    // Check if already checked in
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        ticketId: ticket.id,
        eventId: eventId,
      },
    });

    if (existingAttendance) {
      return {
        success: false,
        message: `Already checked in at ${existingAttendance.checkedInAt.toLocaleString()}`,
        attendance: existingAttendance,
      };
    }

    // Verify event exists and is happening
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      return {
        success: false,
        message: 'Event not found',
      };
    }

    // Optional: Check if event has started (you can uncomment this)
    // const now = new Date();
    // if (now < event.startAt) {
    //   return {
    //     success: false,
    //     message: 'Event has not started yet',
    //   };
    // }

    // Create attendance record
    const attendance = this.attendanceRepository.create({
      ticketId: ticket.id,
      eventId: eventId,
      checkedInBy: checkInDto.checkedInBy,
      checkedInAt: new Date(),
      method: checkInDto.method || CheckInMethod.QR,
      metadata: checkInDto.metadata,
    });

    const savedAttendance = await this.attendanceRepository.save(attendance);

    // Mark ticket as used
    ticket.status = TicketStatus.USED;
    await this.ticketRepository.save(ticket);

    // // Send check-in confirmation email (disabled - email not working on Render)
    // if (ticket.owner?.email) {
    //   const eventLocation = event.venue 
    //     ? `${event.venue.name}, ${event.venue.city}`
    //     : event.customLocation?.city || event.customLocation?.address || 'TBA';
    //
    //   const seatInfo = ticket.seatSection
    //     ? `${ticket.seatSection} - Row ${ticket.seatRow} - Seat ${ticket.seatNumber}`
    //     : undefined;
    //
    //   await this.emailService.sendCheckInConfirmation({
    //     email: ticket.owner.email,
    //     attendeeName: ticket.owner.name || 'Guest',
    //     eventTitle: event.title,
    //     eventDate: event.startAt.toLocaleDateString('en-US', {
    //       weekday: 'long',
    //       year: 'numeric',
    //       month: 'long',
    //       day: 'numeric',
    //       hour: '2-digit',
    //       minute: '2-digit',
    //     }),
    //     eventLocation,
    //     ticketCode: ticket.code,
    //     ticketType: ticket.ticketType?.title || 'General Admission',
    //     checkInTime: savedAttendance.checkedInAt.toLocaleString('en-US', {
    //       weekday: 'long',
    //       year: 'numeric',
    //       month: 'long',
    //       day: 'numeric',
    //       hour: '2-digit',
    //       minute: '2-digit',
    //     }),
    //     checkInMethod: savedAttendance.method,
    //     seatInfo,
    //   });
    // }

    return {
      success: true,
      message: 'Check-in successful',
      attendance: savedAttendance,
      ticketInfo: {
        ticketType: ticket.ticketType?.title || 'General Admission',
        ownerName: ticket.owner?.name || 'Guest',
        eventTitle: event.title,
      },
    };
  }

  /**
   * Validate a ticket without checking in
   */
  async validateTicket(ticketCode: string, eventId: string): Promise<{
    valid: boolean;
    message: string;
    ticketInfo?: any;
  }> {
    const ticket = await this.ticketRepository.findOne({
      where: { code: ticketCode },
      relations: ['owner', 'ticketType', 'event', 'order'],
    });

    if (!ticket) {
      return {
        valid: false,
        message: 'Invalid ticket code',
      };
    }

    if (ticket.eventId !== eventId) {
      return {
        valid: false,
        message: 'Ticket not valid for this event',
      };
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      return {
        valid: false,
        message: 'Ticket has been cancelled',
      };
    }


    // Check if already used
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        ticketId: ticket.id,
        eventId: eventId,
      },
    });

    if (existingAttendance) {
      return {
        valid: false,
        message: `Already checked in at ${existingAttendance.checkedInAt.toLocaleString()}`,
        ticketInfo: {
          checkedInAt: existingAttendance.checkedInAt,
        },
      };
    }

    return {
      valid: true,
      message: 'Ticket is valid',
      ticketInfo: {
        ticketType: ticket.ticketType?.title,
        ownerName: ticket.owner?.name,
        eventTitle: ticket.event?.title,
        orderNumber: ticket.order?.id,
        seatInfo: ticket.seatSection
          ? `${ticket.seatSection} - Row ${ticket.seatRow} - Seat ${ticket.seatNumber}`
          : null,
      },
    };
  }

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
