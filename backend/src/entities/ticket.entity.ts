import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TicketType } from './ticket-type.entity';
import { Event } from './event.entity';
import { Order } from './order.entity';
import { User } from './user.entity';
import { Attendance } from './attendance.entity';

export enum TicketStatus {
  ACTIVE = 'active',
  USED = 'used',
  CANCELLED = 'cancelled',
}

@Entity('tickets')
@Index(['code'], { unique: true })
@Index(['ownerId', 'eventId'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_type_id' })
  ticketTypeId: string;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.tickets)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;

  @Column({ name: 'event_id' })
  eventId: string;

  @ManyToOne(() => Event, (event) => event.tickets)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.tickets)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ unique: true })
  code: string;

  // Seat information
  @Column({ nullable: true, name: 'seat_section' })
  seatSection: string;

  @Column({ nullable: true, name: 'seat_row' })
  seatRow: string;

  @Column({ nullable: true, name: 'seat_number' })
  seatNumber: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.ACTIVE,
  })
  status: TicketStatus;

  @Column({ type: 'timestamp', name: 'issued_at' })
  issuedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Attendance, (attendance) => attendance.ticket)
  attendances: Attendance[];
}
