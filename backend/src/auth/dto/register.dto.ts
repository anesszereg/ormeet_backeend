import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, EventCategory } from '../../entities';

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address (must be unique)',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'User roles',
    enum: UserRole,
    isArray: true,
    example: ['attendee'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @ApiPropertyOptional({
    description: 'Organization ID (if user belongs to an organization)',
    example: 'uuid',
  })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Event categories the ATTENDEE is interested in',
    enum: EventCategory,
    isArray: true,
    example: ['conference', 'workshop'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EventCategory, { each: true })
  interestedEventCategories?: EventCategory[];

  @ApiPropertyOptional({
    description: 'Event types the ORGANIZER wants to host',
    enum: EventCategory,
    isArray: true,
    example: ['conference', 'seminar'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EventCategory, { each: true })
  hostingEventTypes?: EventCategory[];
}
