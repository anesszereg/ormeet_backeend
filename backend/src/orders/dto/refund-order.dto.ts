import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class RefundOrderDto {
  @ApiPropertyOptional({ 
    example: 100.00,
    description: 'Refund amount (defaults to full order amount if not provided)'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;
}
