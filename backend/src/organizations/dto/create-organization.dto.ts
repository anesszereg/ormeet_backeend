import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Tech Events Inc.' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Leading technology event organizer' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'contact@techevents.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://techevents.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: '123 Event Street, City, Country' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'https://logo.url/image.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  ownerId: string;

  @ApiPropertyOptional({
    example: { taxId: '123456789', registrationNumber: 'REG123' },
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
