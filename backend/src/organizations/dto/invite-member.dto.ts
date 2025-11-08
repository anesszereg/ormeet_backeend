import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationMemberRole } from '../../entities';

export class InviteMemberDto {
  @ApiProperty({
    description: 'Email address of the person to invite',
    example: 'organizer@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role to assign to the member',
    enum: OrganizationMemberRole,
    example: OrganizationMemberRole.EDITOR,
  })
  @IsEnum(OrganizationMemberRole)
  role: OrganizationMemberRole;

  @ApiPropertyOptional({
    description: 'Optional message to include in the invitation',
    example: 'Join our team to help organize amazing events!',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
