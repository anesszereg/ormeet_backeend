import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketTypeDto {
  @ApiProperty({ example: 'event-uuid' })
  @IsString()
  eventId: string;

  @ApiProperty({ example: 'VIP Pass' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'Includes backstage access and meet & greet' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  quantityTotal: number;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00Z' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  salesStart?: Date;

  @ApiPropertyOptional({ example: '2025-06-01T00:00:00Z' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  salesEnd?: Date;
}
