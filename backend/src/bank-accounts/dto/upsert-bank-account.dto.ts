import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpsertBankAccountDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  accountHolderName: string;

  @ApiProperty({ example: 'Bank of Example' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'DE89370400440532013000' })
  @IsString()
  @IsNotEmpty()
  iban: string;

  @ApiProperty({ example: 'DEUTDEFF' })
  @IsString()
  @IsNotEmpty()
  swiftBic: string;

  @ApiPropertyOptional({ example: 'organization-uuid' })
  @IsString()
  @IsOptional()
  organizationId?: string;
}
