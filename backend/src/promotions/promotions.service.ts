import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from '../entities';
import { CreatePromotionDto, UpdatePromotionDto } from './dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    // Check if code already exists
    const existing = await this.promotionRepository.findOne({
      where: { code: createPromotionDto.code },
    });

    if (existing) {
      throw new BadRequestException('Promotion code already exists');
    }

    const promotion = this.promotionRepository.create({
      ...createPromotionDto,
      usedCount: 0,
      isActive: true,
    });

    return await this.promotionRepository.save(promotion);
  }

  async findAll(filters?: { eventId?: string; isActive?: boolean }): Promise<Promotion[]> {
    const query = this.promotionRepository.createQueryBuilder('promotion');

    if (filters?.eventId) {
      query.andWhere('promotion.eventId = :eventId', { eventId: filters.eventId });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('promotion.isActive = :isActive', { isActive: filters.isActive });
    }

    query.orderBy('promotion.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return promotion;
  }

  async findByCode(code: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { code },
      relations: ['event'],
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with code ${code} not found`);
    }

    return promotion;
  }

  async validate(code: string): Promise<{ valid: boolean; message?: string; promotion?: Promotion }> {
    const promotion = await this.promotionRepository.findOne({
      where: { code },
    });

    if (!promotion) {
      return { valid: false, message: 'Invalid promotion code' };
    }

    if (!promotion.isActive) {
      return { valid: false, message: 'Promotion is no longer active' };
    }

    const now = new Date();
    if (now < promotion.validFrom) {
      return { valid: false, message: 'Promotion has not started yet' };
    }

    if (now > promotion.validUntil) {
      return { valid: false, message: 'Promotion has expired' };
    }

    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      return { valid: false, message: 'Promotion has reached maximum uses' };
    }

    return { valid: true, promotion };
  }

  async incrementUsage(id: string): Promise<Promotion> {
    const promotion = await this.findOne(id);
    promotion.usedCount += 1;

    // Deactivate if max uses reached
    if (promotion.maxUses && promotion.usedCount >= promotion.maxUses) {
      promotion.isActive = false;
    }

    return await this.promotionRepository.save(promotion);
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto): Promise<Promotion> {
    const promotion = await this.findOne(id);
    Object.assign(promotion, updatePromotionDto);
    return await this.promotionRepository.save(promotion);
  }

  async deactivate(id: string): Promise<Promotion> {
    const promotion = await this.findOne(id);
    promotion.isActive = false;
    return await this.promotionRepository.save(promotion);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionRepository.remove(promotion);
  }
}
