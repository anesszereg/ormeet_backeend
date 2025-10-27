import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { Event } from './event.entity';

export enum CheckInMethod {
  QR = 'qr',
  NFC = 'nfc',
  MANUAL = 'manual',
}

@Entity('attendances')
@Index(['eventId'])
@Index(['checkedInAt'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_id' })
  ticketId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.attendances)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column({ name: 'event_id' })
  eventId: string;

  @ManyToOne(() => Event, (event) => event.attendances)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'checked_in_by', nullable: true })
  checkedInBy: string;

  @Column({ type: 'timestamp', name: 'checked_in_at' })
  checkedInAt: Date;

  @Column({
    type: 'enum',
    enum: CheckInMethod,
    default: CheckInMethod.QR,
  })
  method: CheckInMethod;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
