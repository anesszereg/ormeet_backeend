import { IsEmail, IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../entities';

export class LoginDto {
  @ApiPropertyOptional({
    description: 'Email address (use email OR phone)',
    example: 'john@example.com',
  })
  @ValidateIf((o) => !o.phone)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number with country code (use email OR phone)',
    example: '+1234567890',
  })
  @ValidateIf((o) => !o.email)
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123',
  })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description:
      'Optional account role. Required only when the same email is used ' +
      'for both an attendee and an organizer account.',
    enum: UserRole,
    example: 'attendee',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
