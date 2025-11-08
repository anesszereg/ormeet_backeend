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
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
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

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'amount_subtotal' })
  amountSubtotal: number; // Subtotal before discounts and fees

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'discount_amount' })
  discountAmount: number;

  @Column({ nullable: true, name: 'discount_code' })
  discountCode: string; // Promo code used

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'service_fee' })
  serviceFee: number; // Platform service fee

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'processing_fee' })
  processingFee: number; // Payment processing fee

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'amount_total' })
  amountTotal: number; // Final total (subtotal - discount + fees)

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // Payment information
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
    name: 'payment_method',
  })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true, name: 'payment_provider' })
  paymentProvider: string; // e.g., 'stripe', 'paypal'

  @Column({ nullable: true, name: 'provider_payment_id' })
  providerPaymentId: string; // External payment ID

  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'captured_at' })
  capturedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'refunded_at' })
  refundedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'refund_amount' })
  refundAmount: number;

  @Column({ type: 'simple-array', nullable: true })
  receipts: string[];

  // Billing information
  @Column({ name: 'billing_name' })
  billingName: string;

  @Column({ name: 'billing_email' })
  billingEmail: string;

  @Column({ type: 'jsonb', nullable: true, name: 'billing_address' })
  billingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ nullable: true, name: 'customer_phone' })
  customerPhone: string;

  @Column({ type: 'text', nullable: true, name: 'customer_notes' })
  customerNotes: string; // Special requests or notes

  @Column({ type: 'text', nullable: true, name: 'internal_notes' })
  internalNotes: string; // Admin/organizer notes

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional custom data

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Ticket, (ticket) => ticket.order)
  tickets: Ticket[];
}
