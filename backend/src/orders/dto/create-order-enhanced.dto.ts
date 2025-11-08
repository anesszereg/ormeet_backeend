import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsEnum,
  Min,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../entities';

// Sub-DTOs
export class OrderItemDto {
  @ApiProperty({ example: 'ticket-type-uuid', description: 'Ticket type ID' })
  @IsString()
  ticketTypeId: string;

  @ApiProperty({ example: 2, description: 'Number of tickets' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 99.99, description: 'Price per ticket' })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class BillingAddressDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  state: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  zipCode: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  country: string;
}

export class CreateOrderEnhancedDto {
  @ApiProperty({ example: 'user-uuid', description: 'User placing the order' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'event-uuid', description: 'Event for the tickets' })
  @IsString()
  eventId: string;

  @ApiProperty({
    type: [OrderItemDto],
    description: 'Tickets to purchase',
    example: [
      {
        ticketTypeId: 'ticket-uuid-1',
        quantity: 2,
        unitPrice: 79.99,
      },
      {
        ticketTypeId: 'ticket-uuid-2',
        quantity: 1,
        unitPrice: 299.99,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  // Billing Information
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  billingName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  billingEmail: string;

  @ApiProperty({ type: BillingAddressDto })
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress: BillingAddressDto;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  // Payment Information
  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
    description: 'Payment method to use',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'stripe' })
  @IsOptional()
  @IsString()
  paymentProvider?: string;

  // Discount
  @ApiPropertyOptional({ example: 'SUMMER2025', description: 'Promo code' })
  @IsOptional()
  @IsString()
  discountCode?: string;

  // Notes
  @ApiPropertyOptional({
    example: 'Please seat us together',
    description: 'Special requests from customer',
  })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  // Currency
  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  // Metadata
  @ApiPropertyOptional({
    example: { source: 'mobile_app', campaign: 'summer_sale' },
    description: 'Additional custom data',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
