import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'User full name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'User phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'User bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'User locale' })
  @IsOptional()
  @IsString()
  locale?: string;
}

export class UpdateEmailDto {
  @ApiProperty({ description: 'New email address' })
  @IsEmail()
  newEmail: string;

  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  @MinLength(1)
  password: string;
}

export class UpdatePhoneDto {
  @ApiProperty({ description: 'New phone number' })
  @IsString()
  newPhone: string;

  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  @MinLength(1)
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  @MinLength(1)
  currentPassword: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UpdateLocationDto {
  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;
}
