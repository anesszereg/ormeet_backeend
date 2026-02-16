import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto, UpdateMemberRoleDto, InviteMemberDto, CreateCustomRoleDto, UpdateCustomRoleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, OrganizationMemberRole } from '../entities';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({ status: 200, description: 'Return all organizations' })
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({ status: 200, description: 'Return organization details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Get organizations by owner' })
  @ApiResponse({ status: 200, description: 'Return owner organizations' })
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.organizationsService.findByOwner(ownerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Request() req,
  ) {
    return this.organizationsService.update(
      id,
      updateOrganizationDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete organization' })
  @ApiResponse({ status: 200, description: 'Organization deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.organizationsService.remove(id, req.user.id);
  }

  @Post(':id/members/:userId/:role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add member to organization with specific role' })
  @ApiResponse({ status: 200, description: 'Member added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owners and admins can add members' })
  @ApiResponse({ status: 400, description: 'User is already a member' })
  addMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Param('role') role: OrganizationMemberRole,
    @Request() req,
  ) {
    return this.organizationsService.addMember(id, userId, role, req.user.id);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove member from organization' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owners and admins can remove members' })
  @ApiResponse({ status: 400, description: 'Cannot remove the organization owner' })
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.organizationsService.removeMember(id, userId, req.user.id);
  }

  @Patch(':id/members/:userId/role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update member role in organization' })
  @ApiResponse({ status: 200, description: 'Member role updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only the owner can update roles' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
    @Request() req,
  ) {
    return this.organizationsService.updateMemberRole(
      id,
      userId,
      updateMemberRoleDto.role,
      req.user.id,
    );
  }

  // ========== Invite by Email ==========

  @Post(':id/invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Invite a team member by email' })
  @ApiResponse({ status: 201, description: 'Invitation sent successfully' })
  @ApiResponse({ status: 400, description: 'Already invited' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  inviteMember(
    @Param('id') id: string,
    @Body() inviteMemberDto: InviteMemberDto,
    @Request() req,
  ) {
    return this.organizationsService.inviteMemberByEmail(
      id,
      inviteMemberDto.email,
      inviteMemberDto.role,
      req.user.id,
    );
  }

  @Get(':id/invites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get pending invitations' })
  getPendingInvites(@Param('id') id: string, @Request() req) {
    return this.organizationsService.getPendingInvites(id, req.user.id);
  }

  @Delete(':id/invites/:inviteId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel a pending invitation' })
  cancelInvite(
    @Param('id') id: string,
    @Param('inviteId') inviteId: string,
    @Request() req,
  ) {
    return this.organizationsService.cancelInvite(id, inviteId, req.user.id);
  }

  // ========== Custom Roles ==========

  @Get(':id/roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get custom roles for organization' })
  getCustomRoles(@Param('id') id: string) {
    return this.organizationsService.getCustomRoles(id);
  }

  @Post(':id/roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a custom role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  createCustomRole(
    @Param('id') id: string,
    @Body() createRoleDto: CreateCustomRoleDto,
    @Request() req,
  ) {
    return this.organizationsService.createCustomRole(
      id,
      createRoleDto.name,
      createRoleDto.permissions,
      req.user.id,
    );
  }

  @Patch(':id/roles/:roleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a custom role' })
  updateCustomRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: UpdateCustomRoleDto,
    @Request() req,
  ) {
    return this.organizationsService.updateCustomRole(
      id,
      roleId,
      updateRoleDto,
      req.user.id,
    );
  }

  @Delete(':id/roles/:roleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a custom role' })
  deleteCustomRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @Request() req,
  ) {
    return this.organizationsService.deleteCustomRole(id, roleId, req.user.id);
  }
}
