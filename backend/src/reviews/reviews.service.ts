import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities';
import { CreateReviewDto, UpdateReviewDto } from './dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    // Check if user already reviewed this event
    const existingReview = await this.reviewRepository.findOne({
      where: {
        eventId: createReviewDto.eventId,
        userId: createReviewDto.userId,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this event. Please update your existing review.',
      );
    }

    const review = this.reviewRepository.create(createReviewDto);
    return await this.reviewRepository.save(review);
  }

  async findAll(filters?: {
    eventId?: string;
    userId?: string;
    approved?: boolean;
  }): Promise<Review[]> {
    const query = this.reviewRepository.createQueryBuilder('review');

    if (filters?.eventId) {
      query.andWhere('review.eventId = :eventId', {
        eventId: filters.eventId,
      });
    }

    if (filters?.userId) {
      query.andWhere('review.userId = :userId', { userId: filters.userId });
    }

    if (filters?.approved !== undefined) {
      query.andWhere('review.approved = :approved', {
        approved: filters.approved,
      });
    }

    query
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.event', 'event')
      .orderBy('review.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'event'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async findByEvent(eventId: string): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { eventId, approved: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getEventAverageRating(eventId: string): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.eventId = :eventId', { eventId })
      .andWhere('review.approved = :approved', { approved: true })
      .getRawOne();

    return result.average ? parseFloat(result.average) : 0;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userId: string,
  ): Promise<Review> {
    const review = await this.findOne(id);

    // Check if user owns this review
    if (review.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this review',
      );
    }

    Object.assign(review, updateReviewDto);
    return await this.reviewRepository.save(review);
  }

  async approve(id: string): Promise<Review> {
    const review = await this.findOne(id);
    review.approved = true;
    return await this.reviewRepository.save(review);
  }

  async reject(id: string): Promise<Review> {
    const review = await this.findOne(id);
    review.approved = false;
    return await this.reviewRepository.save(review);
  }

  async remove(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const review = await this.findOne(id);

    // Only owner or admin can delete
    if (review.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this review',
      );
    }

    await this.reviewRepository.remove(review);
  }
}
