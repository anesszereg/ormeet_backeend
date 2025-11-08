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
import { Order } from './order.entity';
import { Ticket } from './ticket.entity';
import { Review } from './review.entity';

export enum UserRole {
  ATTENDEE = 'attendee',
  ORGANIZER = 'organizer',
  ADMIN = 'admin',
}

export enum EventCategory {
  CONFERENCE = 'conference',
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  CONCERT = 'concert',
  SPORTS = 'sports',
  FESTIVAL = 'festival',
  EXHIBITION = 'exhibition',
  NETWORKING = 'networking',
  WEBINAR = 'webinar',
  PARTY = 'party',
  CHARITY = 'charity',
  OTHER = 'other',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['organizationId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'simple-array',
    default: UserRole.ATTENDEE,
  })
  roles: UserRole[];

  // Profile information
  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ type: 'jsonb', nullable: true, name: 'social_links' })
  socialLinks: Array<{ provider: string; url: string }>;

  // User Preferences
  @Column({ type: 'simple-array', nullable: true, name: 'interested_event_categories' })
  interestedEventCategories: EventCategory[]; // For ATTENDEES

  @Column({ type: 'simple-array', nullable: true, name: 'hosting_event_types' })
  hostingEventTypes: EventCategory[]; // For ORGANIZERS

  // Organization relationship
  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // Email verification
  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  emailVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true })
  emailVerificationToken: string;

  @Column({ type: 'timestamp', name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date;

  // Phone verification
  @Column({ type: 'boolean', default: false, name: 'phone_verified' })
  phoneVerified: boolean;

  @Column({ type: 'timestamp', name: 'phone_verified_at', nullable: true })
  phoneVerifiedAt: Date;

  // Password reset
  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken: string;

  @Column({ type: 'timestamp', name: 'password_reset_expires', nullable: true })
  passwordResetExpires: Date;

  // Settings
  @Column({ type: 'boolean', default: true, name: 'email_opt_in' })
  emailOptIn: boolean;

  @Column({ default: 'en' })
  locale: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Ticket, (ticket) => ticket.owner)
  tickets: Ticket[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
