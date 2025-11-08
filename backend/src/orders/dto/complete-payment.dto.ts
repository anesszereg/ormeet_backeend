import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CompletePaymentDto {
  @ApiProperty({ 
    example: 'pi_3ABC123xyz',
    description: 'Payment provider transaction ID (e.g., Stripe payment intent ID)'
  })
  @IsString()
  providerPaymentId: string;
}
