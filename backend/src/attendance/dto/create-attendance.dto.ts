import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional, IsObject } from 'class-validator';
import { CheckInMethod } from '../../entities';

export class CreateAttendanceDto {
  @ApiProperty({
    description: 'Ticket ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  ticketId: string;

  @ApiProperty({
    description: 'Event ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  eventId: string;

  @ApiProperty({
    description: 'User ID who checked in the attendee',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  checkedInBy?: string;

  @ApiProperty({
    description: 'Check-in method',
    enum: CheckInMethod,
    example: CheckInMethod.QR,
  })
  @IsEnum(CheckInMethod)
  method: CheckInMethod;

  @ApiProperty({
    description: 'Additional metadata',
    example: { entrance: 'VIP', section: 'A' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
