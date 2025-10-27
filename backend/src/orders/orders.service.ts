import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities';
import { CreateOrderDto, UpdateOrderDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
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
}
