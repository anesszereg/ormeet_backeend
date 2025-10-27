import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MediaOwnerType {
  EVENT = 'event',
  VENUE = 'venue',
  ORGANIZATION = 'organization',
  USER = 'user',
}

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MediaOwnerType,
    name: 'owner_type',
  })
  ownerType: MediaOwnerType;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column()
  url: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'text', nullable: true })
  caption: string;

  @Column({ nullable: true, name: 'public_id' })
  publicId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
