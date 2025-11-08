import { IsEmail, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
}
