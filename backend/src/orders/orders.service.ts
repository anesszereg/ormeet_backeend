import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, TicketType, Promotion, PromotionType, Ticket, Event } from '../entities';
import { CreateOrderDto, UpdateOrderDto, CreateOrderEnhancedDto } from './dto';
import { EmailService } from '../email/email.service';
import * as QRCode from 'qrcode';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly emailService: EmailService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Calculate total amount
    const amountTotal = createOrderDto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const order = this.orderRepository.create({
      ...createOrderDto,
      amountTotal,
      currency: 'USD',
      status: OrderStatus.PENDING,
    });

    return await this.orderRepository.save(order);
  }

  async findAll(filters?: {
    userId?: string;
    eventId?: string;
    status?: OrderStatus;
  }): Promise<Order[]> {
    const query = this.orderRepository.createQueryBuilder('order');

    if (filters?.userId) {
      query.andWhere('order.userId = :userId', { userId: filters.userId });
    }

    if (filters?.eventId) {
      query.andWhere('order.eventId = :eventId', { eventId: filters.eventId });
    }

    if (filters?.status) {
      query.andWhere('order.status = :status', { status: filters.status });
    }

    query
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.event', 'event')
      .leftJoinAndSelect('order.tickets', 'tickets')
      .orderBy('order.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'event', 'tickets'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { userId },
      relations: ['event', 'tickets'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId: string,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // Check if user owns this order
    if (order.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this order',
      );
    }

    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;

    if (status === OrderStatus.PAID) {
      order.capturedAt = new Date();
    }

    return await this.orderRepository.save(order);
  }

  async processPayment(
    id: string,
    paymentProvider: string,
    providerPaymentId: string,
  ): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in pending status');
    }

    order.paymentProvider = paymentProvider;
    order.providerPaymentId = providerPaymentId;
    order.status = OrderStatus.PAID;
    order.capturedAt = new Date();

    return await this.orderRepository.save(order);
  }

  async refund(id: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Only paid orders can be refunded');
    }

    order.status = OrderStatus.REFUNDED;
    return await this.orderRepository.save(order);
  }

  async remove(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const order = await this.findOne(id);

    // Only owner or admin can delete
    if (order.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this order',
      );
    }

    // Can only delete pending or failed orders
    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Cannot delete paid orders');
    }

    await this.orderRepository.remove(order);
  }

  // Enhanced order creation with discount codes, fees, and validation
  async createEnhanced(createOrderDto: CreateOrderEnhancedDto): Promise<Order> {
    // Validate ticket availability
    for (const item of createOrderDto.items) {
      const ticketType = await this.ticketTypeRepository.findOne({
        where: { id: item.ticketTypeId },
      });

      if (!ticketType) {
        throw new NotFoundException(`Ticket type ${item.ticketTypeId} not found`);
      }

      const available = ticketType.quantityTotal - ticketType.quantitySold;
      if (available < item.quantity) {
        throw new BadRequestException(
          `Only ${available} tickets available for ${ticketType.title}`,
        );
      }

      // Validate max per order
      if (ticketType.maxPerOrder && item.quantity > ticketType.maxPerOrder) {
        throw new BadRequestException(
          `Maximum ${ticketType.maxPerOrder} tickets allowed per order for ${ticketType.title}`,
        );
      }
    }

    // Calculate subtotal
    const amountSubtotal = createOrderDto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    // Apply discount if code provided
    let discountAmount = 0;
    let discountCode: string | undefined = undefined;

    if (createOrderDto.discountCode) {
      const promotion = await this.promotionRepository.findOne({
        where: {
          code: createOrderDto.discountCode,
          eventId: createOrderDto.eventId,
        },
      });

      if (promotion && promotion.isActive) {
        // Check if promotion is still valid
        const now = new Date();
        if (promotion.validFrom <= now && promotion.validUntil >= now) {
          // Check usage limit
          if (!promotion.maxUses || promotion.usedCount < promotion.maxUses) {
            // Calculate discount
            if (promotion.type === PromotionType.PERCENT) {
              discountAmount = (amountSubtotal * promotion.value) / 100;
            } else if (promotion.type === PromotionType.FIXED) {
              discountAmount = Number(promotion.value);
            }
            discountCode = createOrderDto.discountCode;

            // Increment usage count
            promotion.usedCount += 1;
            await this.promotionRepository.save(promotion);
          }
        }
      }
    }

    // Calculate fees (you can customize these based on your business logic)
    const serviceFee = amountSubtotal * 0.05; // 5% service fee
    const processingFee = (amountSubtotal - discountAmount) * 0.029 + 0.30; // Stripe-like fee

    // Calculate final total
    const amountTotal = amountSubtotal - discountAmount + serviceFee + processingFee;

    // Create order
    const order = this.orderRepository.create({
      userId: createOrderDto.userId,
      eventId: createOrderDto.eventId,
      items: createOrderDto.items,
      amountSubtotal,
      discountAmount,
      discountCode,
      serviceFee,
      processingFee,
      amountTotal,
      currency: createOrderDto.currency || 'USD',
      status: OrderStatus.PENDING,
      paymentMethod: createOrderDto.paymentMethod,
      paymentProvider: createOrderDto.paymentProvider,
      billingName: createOrderDto.billingName,
      billingEmail: createOrderDto.billingEmail,
      billingAddress: createOrderDto.billingAddress,
      customerPhone: createOrderDto.customerPhone,
      customerNotes: createOrderDto.customerNotes,
      metadata: createOrderDto.metadata,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Return order with relations
    const orderWithRelations = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['user', 'event', 'tickets'],
    });

    if (!orderWithRelations) {
      throw new NotFoundException('Order not found after creation');
    }

    return orderWithRelations;
  }

  // Update order with payment information
  async completePayment(
    id: string,
    providerPaymentId: string,
  ): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in pending status');
    }

    order.providerPaymentId = providerPaymentId;
    order.status = OrderStatus.PAID;
    order.paidAt = new Date();
    order.capturedAt = new Date();

    // Save order first to ensure it has an ID
    const savedOrder = await this.orderRepository.save(order);

    // Update ticket quantities and generate tickets
    const generatedTickets: Array<{
      id: string;
      code: string;
      ticketType: string;
      price: number;
      qrCodeUrl: string;
    }> = [];
    
    for (const item of savedOrder.items) {
      await this.ticketTypeRepository.increment(
        { id: item.ticketTypeId },
        'quantitySold',
        item.quantity,
      );

      // Get ticket type details
      const ticketType = await this.ticketTypeRepository.findOne({
        where: { id: item.ticketTypeId },
      });

      // Generate tickets for each quantity
      for (let i = 0; i < item.quantity; i++) {
        const ticketCode = this.generateTicketCode();
        
        const ticket = this.ticketRepository.create({
          ticketTypeId: item.ticketTypeId,
          eventId: savedOrder.eventId,
          orderId: savedOrder.id,
          ownerId: savedOrder.userId,
          code: ticketCode,
          issuedAt: new Date(),
        });

        const savedTicket = await this.ticketRepository.save(ticket);
        
        // Generate QR code
        const qrCodeUrl = await this.generateQRCode(ticketCode);
        
        generatedTickets.push({
          id: savedTicket.id,
          code: ticketCode,
          ticketType: ticketType?.title || 'Ticket',
          price: item.unitPrice,
          qrCodeUrl,
        });
      }
    }

    // Get event details for email
    const event = await this.eventRepository.findOne({
      where: { id: order.eventId },
      relations: ['venue'],
    });

    // Send confirmation email
    if (event) {
      const eventLocation = event.venue 
        ? `${event.venue.name}, ${event.venue.city}`
        : event.customLocation?.city || 'TBA';

      await this.emailService.sendOrderConfirmation({
        email: order.billingEmail,
        customerName: order.billingName,
        orderId: order.id,
        eventTitle: event.title,
        eventDate: event.startAt.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        eventLocation,
        tickets: generatedTickets,
        subtotal: Number(order.amountSubtotal),
        discount: Number(order.discountAmount),
        serviceFee: Number(order.serviceFee),
        processingFee: Number(order.processingFee),
        total: Number(order.amountTotal),
        currency: order.currency,
      });
    }

    return savedOrder;
  }

  // Generate unique ticket code
  private generateTicketCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Generate QR code as data URL
  private async generateQRCode(data: string): Promise<string> {
    try {
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR Code generation error:', error);
      // Return a placeholder if QR generation fails
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }
  }

  // Process refund
  async processRefund(id: string, refundAmount?: number): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Only paid orders can be refunded');
    }

    order.status = OrderStatus.REFUNDED;
    order.refundedAt = new Date();
    order.refundAmount = refundAmount || order.amountTotal;

    // Restore ticket quantities
    for (const item of order.items) {
      await this.ticketTypeRepository.decrement(
        { id: item.ticketTypeId },
        'quantitySold',
        item.quantity,
      );
    }

    return await this.orderRepository.save(order);
  }

  // Cancel order
  async cancel(id: string, userId: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    order.status = OrderStatus.CANCELLED;
    return await this.orderRepository.save(order);
  }
}
