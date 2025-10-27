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
import { User } from './user.entity';
import { Event } from './event.entity';
import { Ticket } from './ticket.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('orders')
@Index(['userId'])
@Index(['status'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'event_id' })
  eventId: string;

  @ManyToOne(() => Event, (event) => event.orders)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ type: 'jsonb' })
  items: Array<{
    ticketTypeId: string;
    quantity: number;
    unitPrice: number;
  }>;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'amount_total' })
  amountTotal: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // Payment information
  @Column({ nullable: true, name: 'payment_provider' })
  paymentProvider: string;

  @Column({ nullable: true, name: 'provider_payment_id' })
  providerPaymentId: string;

  @Column({ type: 'timestamp', nullable: true, name: 'captured_at' })
  capturedAt: Date;

  @Column({ type: 'simple-array', nullable: true })
  receipts: string[];

  // Billing information
  @Column({ name: 'billing_name' })
  billingName: string;

  @Column({ name: 'billing_email' })
  billingEmail: string;

  @Column({ type: 'jsonb', nullable: true, name: 'billing_address' })
  billingAddress: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Ticket, (ticket) => ticket.order)
  tickets: Ticket[];
}
