import { IsEmail, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteMemberDto {
  @ApiProperty({
    description: 'Email address of the person to invite',
    example: 'organizer@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role name to assign to the member',
    example: 'Editor',
  })
  @IsString()
  role: string;

  @ApiPropertyOptional({
    description: 'Optional message to include in the invitation',
    example: 'Join our team to help organize amazing events!',
  })
  @IsOptional()
  @IsString()
  message?: string;
}

export class CreateCustomRoleDto {
  @ApiProperty({ description: 'Role name', example: 'Event Manager' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Permissions object' })
  @IsObject()
  permissions: Record<string, Record<string, boolean>>;
}

export class UpdateCustomRoleDto {
  @ApiPropertyOptional({ description: 'Role name', example: 'Event Manager' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Permissions object' })
  @IsOptional()
  @IsObject()
  permissions?: Record<string, Record<string, boolean>>;
}
