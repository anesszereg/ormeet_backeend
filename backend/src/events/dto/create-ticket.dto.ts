import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketTypeEnum } from '../../entities';

export class CreateTicketDto {
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
  quantityTotal: number;

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
  maxPerOrder?: number;

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
  salesEnd?: Date;

  @ApiPropertyOptional({ example: '2025-05-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  salesStart?: Date;

  @ApiPropertyOptional({ example: true, default: true, description: 'Is ticket visible to public?' })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;
}
