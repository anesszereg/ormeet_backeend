import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationMemberRole } from '../../entities';

export class UpdateMemberRoleDto {
  @ApiProperty({
    description: 'New role for the member',
    enum: OrganizationMemberRole,
    example: OrganizationMemberRole.ADMIN,
  })
  @IsEnum(OrganizationMemberRole)
  role: OrganizationMemberRole;
}
