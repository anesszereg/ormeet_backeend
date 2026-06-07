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
import { User } from './user.entity';

export enum BankAccountStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
}

@Entity('bank_accounts')
@Index(['userId'], { unique: true })
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true, name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'account_holder_name' })
  accountHolderName: string;

  @Column({ name: 'bank_name' })
  bankName: string;

  @Column()
  country: string;

  @Column()
  iban: string;

  @Column({ name: 'swift_bic' })
  swiftBic: string;

  @Column({
    type: 'enum',
    enum: BankAccountStatus,
    default: BankAccountStatus.PENDING,
  })
  status: BankAccountStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
