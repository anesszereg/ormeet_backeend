import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'order-uuid' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'ticket-type-uuid' })
  @IsString()
  ticketTypeId: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'A-12' })
  @IsString()
  @IsOptional()
  seatNumber?: string;
}
