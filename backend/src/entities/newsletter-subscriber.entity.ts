import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('newsletter_subscribers')
@Index(['email'], { unique: true })
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  locale?: string;

  @Column({ type: 'boolean', default: false })
  confirmed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
