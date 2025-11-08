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
import { Organization, OrganizationMemberRole } from './organization.entity';
import { User } from './user.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

@Entity('organization_invitations')
@Index(['email'])
@Index(['organizationId'])
@Index(['status'])
export class OrganizationInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: OrganizationMemberRole,
    default: OrganizationMemberRole.VIEWER,
  })
  role: OrganizationMemberRole;

  @Column({ name: 'invited_by' })
  invitedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invited_by' })
  inviter: User;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'accepted_at' })
  acceptedAt: Date;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
