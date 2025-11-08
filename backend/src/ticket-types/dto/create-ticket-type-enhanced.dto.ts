import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsDateString,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketTypeEnum } from '../../entities';

export class CreateTicketTypeEnhancedDto {
  @ApiProperty({ example: 'uuid', description: 'Event ID' })
  @IsUUID()
  eventId: string;

  @ApiProperty({ example: 'VIP Pass' })
  @IsString()
  name: string;

  @ApiProperty({ enum: TicketTypeEnum, example: TicketTypeEnum.VIP })
  @IsEnum(TicketTypeEnum)
  type: TicketTypeEnum;

  @ApiPropertyOptional({ example: 'Includes backstage access and meet & greet' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 100, description: 'Total tickets available' })
  @IsInt()
  @Min(0)
  available: number;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 5, description: 'Maximum tickets per order' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxTicketPerOrder?: number;

  @ApiPropertyOptional({
    example: ['Priority seating', 'Backstage access', 'Meet & greet', 'Exclusive merchandise'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ticketBenefits?: string[];

  @ApiPropertyOptional({ example: '2025-06-01T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  saleEnd?: Date;

  @ApiPropertyOptional({ example: '2025-05-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  saleStart?: Date;

  @ApiPropertyOptional({ example: true, default: true, description: 'Is ticket visible to public?' })
  @IsOptional()
  @IsBoolean()
  ticketVisibility?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;
}
