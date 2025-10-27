import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'event-uuid' })
  @IsString()
  eventId: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Amazing event! Well organized.' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}
