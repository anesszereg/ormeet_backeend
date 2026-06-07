import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID } from 'class-validator';

export class ManualAttendeeDto {
  @ApiProperty({ example: 'event-uuid', description: 'Event to register the attendee for' })
  @IsUUID()
  eventId: string;

  @ApiProperty({ example: 'ticket-type-uuid', description: 'Ticket type to assign' })
  @IsUUID()
  ticketTypeId: string;

  @ApiProperty({ example: 'Jane Doe', description: 'Attendee full name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Attendee email' })
  @IsEmail()
  email: string;
}
