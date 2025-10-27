import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  IsInt,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '../../entities';

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Conference 2025' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Annual technology conference' })
  @IsString()
  shortDescription: string;

  @ApiPropertyOptional({ example: 'Join us for the biggest tech conference...' })
  @IsOptional()
  @IsString()
  longDescription?: string;

  @ApiProperty({ example: 'uuid', description: 'Organization ID' })
  @IsUUID()
  organizerId: string;

  @ApiPropertyOptional({ enum: EventStatus, default: EventStatus.DRAFT })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ example: 'Technology' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: ['tech', 'conference', 'networking'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: ['https://example.com/image1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: 'uuid', description: 'Venue ID' })
  @IsOptional()
  @IsUUID()
  venueId?: string;

  @ApiProperty({ example: '2025-06-15T09:00:00Z' })
  @IsDateString()
  startAt: Date;

  @ApiProperty({ example: '2025-06-15T18:00:00Z' })
  @IsDateString()
  endAt: Date;

  @ApiPropertyOptional({ example: 'UTC', default: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    example: [
      {
        title: 'Opening Keynote',
        description: 'Welcome speech',
        startAt: '2025-06-15T09:00:00Z',
        endAt: '2025-06-15T10:00:00Z',
        speakers: ['John Doe'],
      },
    ],
  })
  @IsOptional()
  @IsArray()
  sessions?: Array<{
    title: string;
    description: string;
    startAt: Date;
    endAt: Date;
    speakers: string[];
  }>;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  capacity?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsInt()
  ageLimit?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  allowReentry?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  refundsAllowed?: boolean;
}
