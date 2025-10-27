import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVenueDto {
  @ApiProperty({ example: 'Grand Convention Center' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Premier event venue in the city' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  state: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  country: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 40.7128 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -74.006 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'venue@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'https://venue-website.com' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  wheelchairAccessible?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  parkingAvailable?: boolean;

  @ApiPropertyOptional({ example: ['WiFi', 'Air Conditioning', 'Stage'] })
  @IsArray()
  @IsOptional()
  amenities?: string[];

  @ApiPropertyOptional({
    example: ['https://image1.jpg', 'https://image2.jpg'],
  })
  @IsArray()
  @IsOptional()
  images?: string[];
}
