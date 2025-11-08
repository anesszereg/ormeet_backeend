import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, User, OrganizationMemberRole } from '../entities';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    role: OrganizationMemberRole,
    requesterId: string,
  ): Promise<Organization> {
    const organization = await this.findOne(organizationId);

    // Check if requester has permission (owner or admin)
    const hasPermission = this.checkMemberPermission(
      organization,
      requesterId,
      [OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN],
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Only owners and admins can add members',
      );
    }

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    const existingMember = organization.members?.find(
      (m) => m.userId === userId,
    );
    if (existingMember) {
      throw new BadRequestException('User is already a member');
    }

    // Add member
    const members = organization.members || [];
    members.push({
      userId,
      role,
      addedAt: new Date(),
      addedBy: requesterId,
    });

    organization.members = members;
    return await this.organizationRepository.save(organization);
  }

  async removeMember(
    organizationId: string,
    userId: string,
    requesterId: string,
  ): Promise<Organization> {
    const organization = await this.findOne(organizationId);

    // Check if requester has permission (owner or admin)
    const hasPermission = this.checkMemberPermission(
      organization,
      requesterId,
      [OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN],
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Only owners and admins can remove members',
      );
    }

    // Cannot remove the owner
    if (userId === organization.ownerId) {
      throw new BadRequestException('Cannot remove the organization owner');
    }

    // Remove member
    const members = organization.members || [];
    const updatedMembers = members.filter((m) => m.userId !== userId);

    if (members.length === updatedMembers.length) {
      throw new NotFoundException('Member not found in organization');
    }

    organization.members = updatedMembers;
    return await this.organizationRepository.save(organization);
  }

  async updateMemberRole(
    organizationId: string,
    userId: string,
    newRole: OrganizationMemberRole,
    requesterId: string,
  ): Promise<Organization> {
    const organization = await this.findOne(organizationId);

    // Only owner can change roles
    if (organization.ownerId !== requesterId) {
      throw new ForbiddenException(
        'Only the organization owner can update member roles',
      );
    }

    // Cannot change owner's role
    if (userId === organization.ownerId) {
      throw new BadRequestException("Cannot change the owner's role");
    }

    // Find and update member
    const members = organization.members || [];
    const memberIndex = members.findIndex((m) => m.userId === userId);

    if (memberIndex === -1) {
      throw new NotFoundException('Member not found in organization');
    }

    members[memberIndex].role = newRole;
    organization.members = members;

    return await this.organizationRepository.save(organization);
  }

  private checkMemberPermission(
    organization: Organization,
    userId: string,
    allowedRoles: OrganizationMemberRole[],
  ): boolean {
    // Owner always has permission
    if (organization.ownerId === userId) {
      return true;
    }

    // Check if user is a member with allowed role
    const member = organization.members?.find((m) => m.userId === userId);
    if (member && allowedRoles.includes(member.role)) {
      return true;
    }

    return false;
  }

  getMemberRole(
    organization: Organization,
    userId: string,
  ): OrganizationMemberRole | null {
    if (organization.ownerId === userId) {
      return OrganizationMemberRole.OWNER;
    }

    const member = organization.members?.find((m) => m.userId === userId);
    return member?.role || null;
  }
}
