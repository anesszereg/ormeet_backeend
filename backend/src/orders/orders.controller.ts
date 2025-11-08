import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, CreateOrderEnhancedDto, CompletePaymentDto, RefundOrderDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, OrderStatus, PaymentMethod } from '../entities';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create enhanced order with all features',
    description: `Create a comprehensive order with:

**Features:**
- ✅ Automatic ticket availability validation
- ✅ Max per order enforcement
- ✅ Discount code application
- ✅ Automatic fee calculation (service + processing)
- ✅ Multiple payment methods
- ✅ Customer notes and metadata

**Example:**
\`\`\`json
{
  "userId": "user-uuid",
  "eventId": "event-uuid",
  "items": [
    {
      "ticketTypeId": "ticket-uuid",
      "quantity": 2,
      "unitPrice": 79.99
    }
  ],
  "discountCode": "SUMMER2025",
  "billingName": "John Doe",
  "billingEmail": "john@example.com",
  "billingAddress": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "customerPhone": "+1234567890",
  "customerNotes": "Please seat us together",
  "paymentMethod": "credit_card",
  "metadata": {
    "source": "mobile_app"
  }
}
\`\`\`

**Pricing Calculation:**
\`\`\`
Subtotal = Σ (quantity × unitPrice)
Discount = From promo code
Service Fee = Subtotal × 5%
Processing Fee = (Subtotal - Discount) × 2.9% + $0.30
Total = Subtotal - Discount + Service Fee + Processing Fee
\`\`\`
    `
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Order created successfully',
    schema: {
      example: {
        id: 'order-uuid',
        userId: 'user-uuid',
        eventId: 'event-uuid',
        items: [{ ticketTypeId: 'ticket-uuid', quantity: 2, unitPrice: 79.99 }],
        amountSubtotal: 159.98,
        discountAmount: 15.00,
        serviceFee: 8.00,
        processingFee: 4.50,
        amountTotal: 157.48,
        currency: 'USD',
        status: 'pending',
        paymentMethod: 'credit_card',
        billingName: 'John Doe',
        billingEmail: 'john@example.com',
        customerNotes: 'Please seat us together',
        createdAt: '2025-11-08T00:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Ticket not available or validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  create(@Body() createOrderDto: CreateOrderEnhancedDto) {
    return this.ordersService.createEnhanced(createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'eventId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiResponse({ status: 200, description: 'Return all orders' })
  findAll(
    @Query('userId') userId?: string,
    @Query('eventId') eventId?: string,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAll({ userId, eventId, status });
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get orders for a specific user' })
  @ApiResponse({ status: 200, description: 'Return user orders' })
  findByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Return order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req,
  ) {
    return this.ordersService.update(id, updateOrderDto, req.user.sub);
  }

  @Post(':id/complete-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Complete payment for order',
    description: `Mark order as paid and update ticket quantities.

**What happens:**
- ✅ Updates order status to PAID
- ✅ Sets paidAt timestamp
- ✅ Increments ticket quantities sold
- ✅ Records payment provider ID

**Example:**
\`\`\`json
{
  "providerPaymentId": "pi_3ABC123xyz"
}
\`\`\`
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment completed successfully',
    schema: {
      example: {
        id: 'order-uuid',
        status: 'paid',
        paidAt: '2025-11-08T10:30:00Z',
        providerPaymentId: 'pi_3ABC123xyz'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Order is not in pending status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  completePayment(
    @Param('id') id: string,
    @Body() paymentData: CompletePaymentDto,
  ) {
    return this.ordersService.completePayment(id, paymentData.providerPaymentId);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Process refund for order (Admin/Organizer only)',
    description: `Refund an order and restore ticket quantities.

**What happens:**
- ✅ Updates order status to REFUNDED
- ✅ Sets refundedAt timestamp
- ✅ Records refund amount
- ✅ Restores ticket quantities (decrements sold count)

**Example for full refund:**
\`\`\`json
{}
\`\`\`

**Example for partial refund:**
\`\`\`json
{
  "refundAmount": 100.00
}
\`\`\`
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order refunded successfully',
    schema: {
      example: {
        id: 'order-uuid',
        status: 'refunded',
        refundedAt: '2025-11-08T15:45:00Z',
        refundAmount: 157.48
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Only paid orders can be refunded' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  refund(
    @Param('id') id: string,
    @Body() refundData: RefundOrderDto,
  ) {
    return this.ordersService.processRefund(id, refundData.refundAmount);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cancel pending order',
    description: `Cancel an order that is still pending payment.

**Requirements:**
- Order must be in PENDING status
- User must own the order

**What happens:**
- ✅ Updates order status to CANCELLED
- ✅ Order cannot be paid after cancellation
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order cancelled successfully',
    schema: {
      example: {
        id: 'order-uuid',
        status: 'cancelled'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Only pending orders can be cancelled' })
  @ApiResponse({ status: 403, description: 'You do not have permission to cancel this order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  cancel(@Param('id') id: string, @Request() req) {
    return this.ordersService.cancel(id, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete order' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete paid orders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.roles?.includes(UserRole.ADMIN);
    return this.ordersService.remove(id, req.user.sub, isAdmin);
  }
}
