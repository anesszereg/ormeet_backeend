import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event, Ticket } from '../entities';
import { EmailService } from './email.service';
import { EventReminderService } from './event-reminder.service';
import { EmailController } from './email.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Event, Ticket])],
  controllers: [EmailController],
  providers: [EmailService, EventReminderService],
  exports: [EmailService, EventReminderService],
})
export class EmailModule {}
