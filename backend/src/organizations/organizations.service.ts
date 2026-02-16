import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, User, OrganizationMemberRole } from '../entities';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
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
      relations: ['owner', 'events'],
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

  // ========== Invite by Email ==========

  async inviteMemberByEmail(
    organizationId: string,
    email: string,
    roleName: string,
    requesterId: string,
  ): Promise<{ inviteCode: string; email: string }> {
    const organization = await this.findOne(organizationId);

    // Only owner/admin can invite
    if (organization.ownerId !== requesterId) {
      const member = organization.members?.find((m) => m.userId === requesterId);
      if (!member || ![OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN].includes(member.role)) {
        throw new ForbiddenException('Only owners and admins can invite members');
      }
    }

    // Check if already a pending invite for this email
    const settings = organization.settings || {};
    const pendingInvites = settings.pendingInvites || [];
    const existingInvite = pendingInvites.find((inv: any) => inv.email === email && inv.status === 'pending');
    if (existingInvite) {
      throw new BadRequestException('An invitation has already been sent to this email');
    }

    // Generate invite code
    const inviteCode = uuidv4().split('-')[0].toUpperCase();

    // Store pending invite
    pendingInvites.push({
      id: uuidv4(),
      email,
      role: roleName,
      inviteCode,
      status: 'pending',
      invitedBy: requesterId,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    settings.pendingInvites = pendingInvites;
    organization.settings = settings;
    await this.organizationRepository.save(organization);

    // Get inviter name
    const inviter = await this.userRepository.findOne({ where: { id: requesterId } });
    const inviterName = inviter?.name || 'A team member';

    // Send email (don't fail if email fails)
    try {
      await this.emailService.sendTeamInviteEmail({
        email,
        organizationName: organization.name,
        inviterName,
        roleName,
        inviteCode,
      });
    } catch (error) {
      this.logger.error(`Failed to send invite email to ${email}:`, error.message);
    }

    return { inviteCode, email };
  }

  async getPendingInvites(organizationId: string, requesterId: string): Promise<any[]> {
    const organization = await this.findOne(organizationId);
    if (organization.ownerId !== requesterId) {
      throw new ForbiddenException('Only the owner can view pending invites');
    }
    return organization.settings?.pendingInvites?.filter((inv: any) => inv.status === 'pending') || [];
  }

  async cancelInvite(organizationId: string, inviteId: string, requesterId: string): Promise<void> {
    const organization = await this.findOne(organizationId);
    if (organization.ownerId !== requesterId) {
      throw new ForbiddenException('Only the owner can cancel invites');
    }

    const settings = organization.settings || {};
    const pendingInvites = settings.pendingInvites || [];
    const invite = pendingInvites.find((inv: any) => inv.id === inviteId);
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    invite.status = 'cancelled';
    settings.pendingInvites = pendingInvites;
    organization.settings = settings;
    await this.organizationRepository.save(organization);
  }

  // ========== Custom Roles ==========

  async getCustomRoles(organizationId: string): Promise<any[]> {
    const organization = await this.findOne(organizationId);
    return organization.settings?.customRoles || [];
  }

  async createCustomRole(
    organizationId: string,
    name: string,
    permissions: Record<string, Record<string, boolean>>,
    requesterId: string,
  ): Promise<any> {
    const organization = await this.findOne(organizationId);
    if (organization.ownerId !== requesterId) {
      throw new ForbiddenException('Only the owner can create roles');
    }

    const settings = organization.settings || {};
    const customRoles = settings.customRoles || [];

    // Check duplicate name
    if (customRoles.some((r: any) => r.name.toLowerCase() === name.trim().toLowerCase())) {
      throw new BadRequestException('A role with this name already exists');
    }

    const newRole = {
      id: uuidv4(),
      name: name.trim(),
      permissions,
      createdAt: new Date().toISOString(),
    };

    customRoles.push(newRole);
    settings.customRoles = customRoles;
    organization.settings = settings;
    await this.organizationRepository.save(organization);

    return newRole;
  }

  async updateCustomRole(
    organizationId: string,
    roleId: string,
    data: { name?: string; permissions?: Record<string, Record<string, boolean>> },
    requesterId: string,
  ): Promise<any> {
    const organization = await this.findOne(organizationId);
    if (organization.ownerId !== requesterId) {
      throw new ForbiddenException('Only the owner can update roles');
    }

    const settings = organization.settings || {};
    const customRoles = settings.customRoles || [];
    const roleIndex = customRoles.findIndex((r: any) => r.id === roleId);

    if (roleIndex === -1) {
      throw new NotFoundException('Role not found');
    }

    // Check duplicate name (exclude current role)
    if (data.name && customRoles.some((r: any, i: number) => i !== roleIndex && r.name.toLowerCase() === data.name!.trim().toLowerCase())) {
      throw new BadRequestException('A role with this name already exists');
    }

    if (data.name) customRoles[roleIndex].name = data.name.trim();
    if (data.permissions) customRoles[roleIndex].permissions = data.permissions;
    customRoles[roleIndex].updatedAt = new Date().toISOString();

    settings.customRoles = customRoles;
    organization.settings = settings;
    await this.organizationRepository.save(organization);

    return customRoles[roleIndex];
  }

  async deleteCustomRole(
    organizationId: string,
    roleId: string,
    requesterId: string,
  ): Promise<void> {
    const organization = await this.findOne(organizationId);
    if (organization.ownerId !== requesterId) {
      throw new ForbiddenException('Only the owner can delete roles');
    }

    const settings = organization.settings || {};
    const customRoles = settings.customRoles || [];
    const filtered = customRoles.filter((r: any) => r.id !== roleId);

    if (filtered.length === customRoles.length) {
      throw new NotFoundException('Role not found');
    }

    settings.customRoles = filtered;
    organization.settings = settings;
    await this.organizationRepository.save(organization);
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
