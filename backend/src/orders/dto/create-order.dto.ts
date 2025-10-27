import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsEmail, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({ example: 'ticket-type-uuid' })
  @IsString()
  ticketTypeId: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 99.99 })
  unitPrice: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'event-uuid' })
  @IsString()
  eventId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  billingName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  billingEmail: string;

  @ApiProperty({ example: { street: '123 Main St', city: 'New York', country: 'USA' } })
  @IsObject()
  @IsOptional()
  billingAddress?: Record<string, any>;
}
