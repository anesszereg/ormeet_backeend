import { IsEmail, IsEnum, IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationType } from '../../entities';

export class LoginWithCodeDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
    required: false,
  })
  @ValidateIf((o) => o.type === VerificationType.EMAIL || !o.phone)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number with country code',
    example: '+1234567890',
    required: false,
  })
  @ValidateIf((o) => o.type === VerificationType.PHONE || !o.email)
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Type of login',
    enum: VerificationType,
    example: VerificationType.EMAIL,
  })
  @IsEnum(VerificationType)
  type: VerificationType;

  @ApiProperty({
    description: '6-digit verification code',
    example: '123456',
  })
  @IsString()
  @Length(6, 6)
  code: string;
}
