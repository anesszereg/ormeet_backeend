import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsString as IsString_ } from 'class-validator';

export class EventGuidelinesDto {
  @ApiPropertyOptional({ example: '18+' })
  @IsOptional()
  @IsString_()
  ageRequirement?: string;

  @ApiPropertyOptional({ example: 'Full refund up to 7 days before event' })
  @IsOptional()
  @IsString_()
  refundPolicy?: string;

  @ApiPropertyOptional({ example: 'Wheelchair accessible, ASL interpreter available' })
  @IsOptional()
  @IsString_()
  accessibleInfo?: string;

  @ApiPropertyOptional({ example: 'Doors open 30 minutes before start' })
  @IsOptional()
  @IsString_()
  entryPolicy?: string;

  @ApiPropertyOptional({ example: ['Weapons', 'Outside food', 'Professional cameras'] })
  @IsOptional()
  @IsArray()
  @IsString_({ each: true })
  prohibitedItems?: string[];

  @ApiPropertyOptional({ example: ['Small bags', 'Water bottles', 'Phones'] })
  @IsOptional()
  @IsArray()
  @IsString_({ each: true })
  allowedItems?: string[];

  @ApiPropertyOptional({ example: 'Free parking available in Lot A' })
  @IsOptional()
  @IsString_()
  parkingInfo?: string;

  @ApiPropertyOptional({
    example: [{ question: 'Can I get a refund?', answer: 'Yes, within 48 hours' }],
  })
  @IsOptional()
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}