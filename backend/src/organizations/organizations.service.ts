import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    const organization = this.organizationRepository.create(
      createOrganizationDto,
    );
    return await this.organizationRepository.save(organization);
  }

  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find({
      relations: ['owner', 'events'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['owner', 'events', 'members'],
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async findByOwner(ownerId: string): Promise<Organization[]> {
    return await this.organizationRepository.find({
      where: { ownerId },
      relations: ['events'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    userId: string,
  ): Promise<Organization> {
    const organization = await this.findOne(id);

    // Check if user is the owner
    if (organization.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this organization',
      );
    }

    Object.assign(organization, updateOrganizationDto);
    return await this.organizationRepository.save(organization);
  }

  async remove(id: string, userId: string): Promise<void> {
    const organization = await this.findOne(id);

    // Check if user is the owner
    if (organization.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this organization',
      );
    }

    await this.organizationRepository.remove(organization);
  }

  async addMember(
    organizationId: string,
    userId: string,
    requesterId: string,
  ): Promise<Organization> {
    const organization = await this.findOne(organizationId);

    // Check if requester is the owner
    if (organization.ownerId !== requesterId) {
      throw new ForbiddenException(
        'Only the organization owner can add members',
      );
    }

    // Add member logic would go here
    // This requires updating the User entity relationship
    return organization;
  }

  async removeMember(
    organizationId: string,
    userId: string,
    requesterId: string,
  ): Promise<Organization> {
    const organization = await this.findOne(organizationId);

    // Check if requester is the owner
    if (organization.ownerId !== requesterId) {
      throw new ForbiddenException(
        'Only the organization owner can remove members',
      );
    }

    // Remove member logic would go here
    return organization;
  }
}
