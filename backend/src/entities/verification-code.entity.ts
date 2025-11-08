import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum VerificationType {
  EMAIL = 'email',
  PHONE = 'phone',
}

export enum VerificationPurpose {
  REGISTRATION = 'registration',
  LOGIN = 'login',
  PASSWORD_RESET = 'password_reset',
  PHONE_VERIFICATION = 'phone_verification',
  EMAIL_VERIFICATION = 'email_verification',
}

@Entity('verification_codes')
@Index(['identifier', 'type'])
@Index(['code'])
@Index(['expiresAt'])
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Email or phone number
  @Column()
  identifier: string;

  @Column({
    type: 'enum',
    enum: VerificationType,
  })
  type: VerificationType;

  @Column({
    type: 'enum',
    enum: VerificationPurpose,
  })
  purpose: VerificationPurpose;

  // 6-digit code
  @Column({ length: 6 })
  code: string;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'verified_at' })
  verifiedAt: Date;

  @Column({ type: 'int', default: 0, name: 'attempts' })
  attempts: number;

  @Column({ type: 'int', default: 3, name: 'max_attempts' })
  maxAttempts: number;

  @Column({ nullable: true, name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
