import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationType, VerificationPurpose } from '../../entities';

export class SendVerificationCodeDto {
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
    description: 'Type of verification',
    enum: VerificationType,
    example: VerificationType.EMAIL,
  })
  @IsEnum(VerificationType)
  type: VerificationType;

  @ApiProperty({
    description: 'Purpose of verification',
    enum: VerificationPurpose,
    example: VerificationPurpose.LOGIN,
  })
  @IsEnum(VerificationPurpose)
  purpose: VerificationPurpose;
}
