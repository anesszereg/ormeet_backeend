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
import { Event } from './event.entity';
import { Ticket } from './ticket.entity';

export enum TicketTypeEnum {
  GENERAL = 'general',
  VIP = 'vip',
  EARLY_BIRD = 'early-bird',
}

@Entity('ticket_types')
@Index(['eventId'])
@Index(['price'])
export class TicketType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @ManyToOne(() => Event, (event) => event.ticketTypes)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'int', name: 'quantity_total' })
  quantityTotal: number;

  @Column({ type: 'int', default: 0, name: 'quantity_sold' })
  quantitySold: number;

  @Column({ type: 'int', nullable: true, name: 'max_per_order' })
  maxPerOrder: number; // Maximum tickets per order

  @Column({ type: 'timestamp', nullable: true, name: 'sales_start' })
  salesStart: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'sales_end' })
  salesEnd: Date;

  @Column({ type: 'simple-array', nullable: true, name: 'ticket_benefits' })
  ticketBenefits: string[]; // List of benefits for this ticket type

  @Column({ type: 'boolean', default: true, name: 'is_visible' })
  isVisible: boolean; // Ticket visibility (hidden tickets for special access)

  @Column({ type: 'boolean', default: false, name: 'is_free' })
  isFree: boolean;

  @Column({
    type: 'enum',
    enum: TicketTypeEnum,
    default: TicketTypeEnum.GENERAL,
  })
  type: TicketTypeEnum;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Computed field for availability
  get available(): number {
    return this.quantityTotal - this.quantitySold;
  }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Ticket, (ticket) => ticket.ticketType)
  tickets: Ticket[];
}
