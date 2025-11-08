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
import { Organization } from './organization.entity';
import { Venue } from './venue.entity';
import { TicketType } from './ticket-type.entity';
import { Order } from './order.entity';
import { Ticket } from './ticket.entity';
import { Attendance } from './attendance.entity';
import { Review } from './review.entity';
import { Promotion } from './promotion.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
}

export enum EventDateType {
  ONE_TIME = 'one_time',
  MULTIPLE = 'multiple',
}

export enum RecurringPattern {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum LocationType {
  PHYSICAL = 'physical',
  ONLINE = 'online',
  TO_BE_ANNOUNCED = 'to_be_announced',
}

@Entity('events')
@Index(['title'])
@Index(['organizerId', 'startAt'])
@Index(['tags'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', name: 'short_description' })
  shortDescription: string;

  @Column({ type: 'text', name: 'long_description', nullable: true })
  longDescription: string;

  @Column({ name: 'organizer_id' })
  organizerId: string;

  @ManyToOne(() => Organization, (org) => org.events)
  @JoinColumn({ name: 'organizer_id' })
  organizer: Organization;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'simple-array', nullable: true })
  videos: string[];

  // Location Configuration
  @Column({
    type: 'enum',
    enum: LocationType,
    default: LocationType.PHYSICAL,
    name: 'location_type',
  })
  locationType: LocationType;

  // Physical Location
  @Column({ name: 'venue_id', nullable: true })
  venueId: string;

  @ManyToOne(() => Venue, (venue) => venue.events, { nullable: true })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ type: 'jsonb', nullable: true, name: 'custom_location' })
  customLocation: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    postalCode: string;
    country: string;
  };

  // Online Location
  @Column({ type: 'text', nullable: true, name: 'online_link' })
  onlineLink: string;

  @Column({ type: 'text', nullable: true, name: 'online_instructions' })
  onlineInstructions: string; // How to join

  // Date & Time Configuration
  @Column({
    type: 'enum',
    enum: EventDateType,
    default: EventDateType.ONE_TIME,
    name: 'date_type',
  })
  dateType: EventDateType;

  @Column({ type: 'timestamp', name: 'start_at' })
  startAt: Date;

  @Column({ type: 'timestamp', name: 'end_at' })
  endAt: Date;

  @Column({ default: 'UTC' })
  timezone: string;

  // Recurring Event Fields (for MULTIPLE date type)
  @Column({
    type: 'enum',
    enum: RecurringPattern,
    nullable: true,
    name: 'recurring_pattern',
  })
  recurringPattern: RecurringPattern;

  @Column({ type: 'int', nullable: true, name: 'recurring_count' })
  recurringCount: number; // How many times it repeats

  @Column({ type: 'timestamp', nullable: true, name: 'recurring_end_date' })
  recurringEndDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  sessions: Array<{
    title: string;
    description: string;
    startAt: Date;
    endAt: Date;
    speakers: string[];
  }>;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  // Settings
  @Column({ type: 'int', nullable: true, name: 'age_limit' })
  ageLimit: number;

  @Column({ type: 'boolean', default: true, name: 'allow_reentry' })
  allowReentry: boolean;

  @Column({ type: 'boolean', default: false, name: 'refunds_allowed' })
  refundsAllowed: boolean;

  // Event Guidelines
  @Column({ type: 'jsonb', nullable: true })
  guidelines: {
    ageRequirement: string; // e.g., "18+", "All ages", "21+"
    refundPolicy: string;
    accessibleInfo: string;
    entryPolicy: string;
    prohibitedItems: string[];
    allowedItems: string[];
    parkingInfo: string;
  };

  @Column({ type: 'timestamp', nullable: true, name: 'published_at' })
  publishedAt: Date;

  // Metrics
  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  favorites: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => TicketType, (ticketType) => ticketType.event)
  ticketTypes: TicketType[];

  @OneToMany(() => Order, (order) => order.event)
  orders: Order[];

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Ticket[];

  @OneToMany(() => Attendance, (attendance) => attendance.event)
  attendances: Attendance[];

  @OneToMany(() => Review, (review) => review.event)
  reviews: Review[];

  @OneToMany(() => Promotion, (promotion) => promotion.event)
  promotions: Promotion[];

  // Event Participants (stored as JSONB for flexibility)
  @Column({ type: 'jsonb', nullable: true })
  speakers: Array<{
    name: string;
    role: string;
    bio: string;
    image: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  performers: Array<{
    company: string;
    type: string;
    description: string;
    image: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  sponsors: Array<{
    sponsorName: string;
    sponsorshipTier: string; // e.g., "Gold", "Silver", "Bronze"
    about: string;
    logo: string;
  }>;
}
