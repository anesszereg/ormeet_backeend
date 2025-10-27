import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';

export async function paginate<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  paginationDto: PaginationDto,
): Promise<PaginatedResponseDto<T>> {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;

  const skip = (page - 1) * limit;

  // Apply sorting
  queryBuilder.orderBy(`${queryBuilder.alias}.${sortBy}`, sortOrder);

  // Apply pagination
  queryBuilder.skip(skip).take(limit);

  // Execute query
  const [data, total] = await queryBuilder.getManyAndCount();

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export function applySearch<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  searchTerm: string,
  searchFields: string[],
): SelectQueryBuilder<T> {
  if (!searchTerm || searchFields.length === 0) {
    return queryBuilder;
  }

  const conditions = searchFields
    .map((field) => `${queryBuilder.alias}.${field} ILIKE :searchTerm`)
    .join(' OR ');

  queryBuilder.andWhere(`(${conditions})`, { searchTerm: `%${searchTerm}%` });

  return queryBuilder;
}
