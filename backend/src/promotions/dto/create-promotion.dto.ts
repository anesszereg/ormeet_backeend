import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsOptional, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PromotionType } from '../../entities';

export class CreatePromotionDto {
  @ApiProperty({ example: 'SUMMER2025' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'Summer discount' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: PromotionType, example: PromotionType.PERCENT })
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiProperty({ example: 20, description: 'Percentage (0-100) when type=percent, or fixed amount when type=fixed' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxUses?: number;

  @ApiProperty({ example: '2025-06-01T00:00:00Z' })
  @IsDate()
  @Type(() => Date)
  validFrom: Date;

  @ApiProperty({ example: '2025-08-31T23:59:59Z' })
  @IsDate()
  @Type(() => Date)
  validUntil: Date;

  @ApiPropertyOptional({ example: 'event-uuid' })
  @IsString()
  @IsOptional()
  eventId?: string;
}
