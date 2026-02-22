import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event, Ticket } from '../entities';
import { EmailService } from './email.service';
import { EventReminderService } from './event-reminder.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Event, Ticket])],
  providers: [EmailService, EventReminderService],
  exports: [EmailService],
})
export class EmailModule {}
