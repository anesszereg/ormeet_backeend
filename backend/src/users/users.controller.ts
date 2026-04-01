import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  UpdateEmailDto,
  UpdatePhoneDto,
  ChangePasswordDto,
  UpdateLocationDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    // req.user is the full user object from JwtStrategy.validate()
    return this.usersService.findById(req.user.id);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update user profile (name, phone, bio, avatar)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Patch('me/email')
  @ApiOperation({ summary: 'Update user email (requires password verification)' })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  @ApiResponse({ status: 400, description: 'Email already in use' })
  async updateEmail(@Request() req, @Body() dto: UpdateEmailDto) {
    return this.usersService.updateEmail(req.user.id, dto);
  }

  @Patch('me/phone')
  @ApiOperation({ summary: 'Update user phone (requires password verification)' })
  @ApiResponse({ status: 200, description: 'Phone updated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  async updatePhone(@Request() req, @Body() dto: UpdatePhoneDto) {
    return this.usersService.updatePhone(req.user.id, dto);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto);
  }

  @Patch('me/location')
  @ApiOperation({ summary: 'Update user location' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateLocation(@Request() req, @Body() dto: UpdateLocationDto) {
    return this.usersService.updateLocation(req.user.id, dto);
  }
}
