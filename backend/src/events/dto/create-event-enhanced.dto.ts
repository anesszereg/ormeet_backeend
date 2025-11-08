import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  IsInt,
  IsBoolean,
  IsUUID,
  IsUrl,
  IsObject,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus, EventDateType, RecurringPattern, LocationType } from '../../entities';
import { CreateTicketDto } from './create-ticket.dto';

// Sub-DTOs for nested objects
export class CustomLocationDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  state: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  zipCode: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  country: string;
}

export class EventGuidelinesDto {
  @ApiPropertyOptional({ example: '18+' })
  @IsOptional()
  @IsString()
  ageRequirement?: string;

  @ApiPropertyOptional({ example: 'Full refund up to 7 days before event' })
  @IsOptional()
  @IsString()
  refundPolicy?: string;

  @ApiPropertyOptional({ example: 'Wheelchair accessible, ASL interpreter available' })
  @IsOptional()
  @IsString()
  accessibleInfo?: string;

  @ApiPropertyOptional({ example: 'Doors open 30 minutes before start time' })
  @IsOptional()
  @IsString()
  entryPolicy?: string;

  @ApiPropertyOptional({ example: ['Weapons', 'Outside food', 'Professional cameras'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prohibitedItems?: string[];

  @ApiPropertyOptional({ example: ['Small bags', 'Water bottles', 'Phones'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedItems?: string[];

  @ApiPropertyOptional({ example: 'Free parking available in Lot A' })
  @IsOptional()
  @IsString()
  parkingInfo?: string;
}

export class SpeakerDto {
  @ApiProperty({ example: 'Dr. Jane Smith' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Keynote Speaker' })
  @IsString()
  role: string;

  @ApiProperty({ example: 'Dr. Smith is a renowned expert in AI...' })
  @IsString()
  bio: string;

  @ApiProperty({ example: 'https://example.com/speaker.jpg' })
  @IsUrl()
  image: string;
}

export class PerformerDto {
  @ApiProperty({ example: 'The Jazz Band' })
  @IsString()
  company: string;

  @ApiProperty({ example: 'Musical Performance' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Award-winning jazz ensemble...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'https://example.com/band.jpg' })
  @IsUrl()
  image: string;
}

export class SponsorDto {
  @ApiProperty({ example: 'Tech Corp Inc.' })
  @IsString()
  sponsorName: string;

  @ApiProperty({ example: 'Gold', description: 'Gold, Silver, Bronze, etc.' })
  @IsString()
  sponsorshipTier: string;

  @ApiProperty({ example: 'Leading technology company...' })
  @IsString()
  about: string;

  @ApiProperty({ example: 'https://example.com/logo.png' })
  @IsUrl()
  logo: string;
}

export class CreateEventEnhancedDto {
  // Basic Information
  @ApiProperty({ example: 'Tech Conference 2025' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'conference', description: 'Event type/category' })
  @IsString()
  type: string;

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

  // Media
  @ApiPropertyOptional({ example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({ example: ['https://example.com/video1.mp4'] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  videos?: string[];

  @ApiPropertyOptional({ example: ['tech', 'conference', 'networking'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Date & Time Configuration
  @ApiProperty({ enum: EventDateType, example: EventDateType.ONE_TIME })
  @IsEnum(EventDateType)
  dateType: EventDateType;

  @ApiProperty({ example: '2025-06-15T09:00:00Z' })
  @IsDateString()
  startAt: Date;

  @ApiProperty({ example: '2025-06-15T18:00:00Z' })
  @IsDateString()
  endAt: Date;

  @ApiPropertyOptional({ example: 'America/New_York', default: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;

  // Recurring Event Fields (only for MULTIPLE date type)
  @ApiPropertyOptional({ enum: RecurringPattern, example: RecurringPattern.WEEKLY })
  @IsOptional()
  @IsEnum(RecurringPattern)
  recurringPattern?: RecurringPattern;

  @ApiPropertyOptional({ example: 10, description: 'How many times the event repeats' })
  @IsOptional()
  @IsInt()
  @Min(1)
  recurringCount?: number;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  recurringEndDate?: Date;

  // Location Configuration
  @ApiProperty({ enum: LocationType, example: LocationType.PHYSICAL })
  @IsEnum(LocationType)
  locationType: LocationType;

  // Physical Location (for PHYSICAL type)
  @ApiPropertyOptional({ example: 'uuid', description: 'Venue ID from venues table' })
  @IsOptional()
  @IsUUID()
  venueId?: string;

  @ApiPropertyOptional({ type: CustomLocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomLocationDto)
  customLocation?: CustomLocationDto;

  // Online Location (for ONLINE type)
  @ApiPropertyOptional({ example: 'https://zoom.us/j/123456789' })
  @IsOptional()
  @IsUrl()
  onlineLink?: string;

  @ApiPropertyOptional({ example: 'Join 15 minutes early. Meeting ID: 123-456-789' })
  @IsOptional()
  @IsString()
  onlineInstructions?: string;

  // Capacity
  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  // Guidelines
  @ApiPropertyOptional({ type: EventGuidelinesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EventGuidelinesDto)
  guidelines?: EventGuidelinesDto;

  // Participants
  @ApiPropertyOptional({ type: [SpeakerDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpeakerDto)
  speakers?: SpeakerDto[];

  @ApiPropertyOptional({ type: [PerformerDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PerformerDto)
  performers?: PerformerDto[];

  @ApiPropertyOptional({ type: [SponsorDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SponsorDto)
  sponsors?: SponsorDto[];

  // Tickets
  @ApiPropertyOptional({ 
    type: [CreateTicketDto],
    description: 'Create tickets along with the event',
    example: [
      {
        name: 'General Admission',
        type: 'general',
        quantityTotal: 100,
        price: 49.99,
        maxPerOrder: 5,
        ticketBenefits: ['Entry to event', 'Event swag bag']
      },
      {
        name: 'VIP Pass',
        type: 'vip',
        quantityTotal: 20,
        price: 199.99,
        maxPerOrder: 2,
        ticketBenefits: ['Priority entry', 'VIP lounge access', 'Meet & greet']
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTicketDto)
  tickets?: CreateTicketDto[];
}
