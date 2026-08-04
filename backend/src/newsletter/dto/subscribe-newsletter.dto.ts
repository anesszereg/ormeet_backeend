import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeNewsletterDto {
  @ApiProperty({ description: 'Subscriber email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Preferred locale', example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}
