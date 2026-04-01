import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserPreferencesService } from './user-preferences.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('User Preferences')
@Controller('user-preferences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  // ========== Favorite Events ==========

  @Get('favorites/events')
  @ApiOperation({ summary: 'Get user favorite events' })
  @ApiResponse({ status: 200, description: 'Returns list of favorite events' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFavoriteEvents(@Request() req) {
    return this.userPreferencesService.getFavoriteEvents(req.user.id);
  }

  @Post('favorites/events/:eventId')
  @ApiOperation({ summary: 'Add event to favorites' })
  @ApiParam({ name: 'eventId', description: 'Event UUID' })
  @ApiResponse({ status: 201, description: 'Event added to favorites' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 409, description: 'Event already in favorites' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addFavoriteEvent(
    @Request() req,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    await this.userPreferencesService.addFavoriteEvent(req.user.id, eventId);
    return { message: 'Event added to favorites' };
  }

  @Delete('favorites/events/:eventId')
  @ApiOperation({ summary: 'Remove event from favorites' })
  @ApiParam({ name: 'eventId', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Event removed from favorites' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeFavoriteEvent(
    @Request() req,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    await this.userPreferencesService.removeFavoriteEvent(req.user.id, eventId);
    return { message: 'Event removed from favorites' };
  }

  @Get('favorites/events/:eventId/check')
  @ApiOperation({ summary: 'Check if event is favorited' })
  @ApiParam({ name: 'eventId', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Returns favorite status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async isFavoriteEvent(
    @Request() req,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    const isFavorite = await this.userPreferencesService.isFavoriteEvent(req.user.id, eventId);
    return { isFavorite };
  }

  // ========== Following Organizers ==========

  @Get('following/organizers')
  @ApiOperation({ summary: 'Get organizers user is following' })
  @ApiResponse({ status: 200, description: 'Returns list of followed organizers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFollowingOrganizers(@Request() req) {
    return this.userPreferencesService.getFollowingOrganizers(req.user.id);
  }

  @Post('following/organizers/:organizerId')
  @ApiOperation({ summary: 'Follow an organizer' })
  @ApiParam({ name: 'organizerId', description: 'Organizer UUID' })
  @ApiResponse({ status: 201, description: 'Now following organizer' })
  @ApiResponse({ status: 404, description: 'Organizer not found' })
  @ApiResponse({ status: 409, description: 'Already following organizer' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async followOrganizer(
    @Request() req,
    @Param('organizerId', ParseUUIDPipe) organizerId: string,
  ) {
    await this.userPreferencesService.followOrganizer(req.user.id, organizerId);
    return { message: 'Now following organizer' };
  }

  @Delete('following/organizers/:organizerId')
  @ApiOperation({ summary: 'Unfollow an organizer' })
  @ApiParam({ name: 'organizerId', description: 'Organizer UUID' })
  @ApiResponse({ status: 200, description: 'Unfollowed organizer' })
  @ApiResponse({ status: 404, description: 'Not following this organizer' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unfollowOrganizer(
    @Request() req,
    @Param('organizerId', ParseUUIDPipe) organizerId: string,
  ) {
    await this.userPreferencesService.unfollowOrganizer(req.user.id, organizerId);
    return { message: 'Unfollowed organizer' };
  }

  @Get('following/organizers/:organizerId/check')
  @ApiOperation({ summary: 'Check if following organizer' })
  @ApiParam({ name: 'organizerId', description: 'Organizer UUID' })
  @ApiResponse({ status: 200, description: 'Returns following status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async isFollowingOrganizer(
    @Request() req,
    @Param('organizerId', ParseUUIDPipe) organizerId: string,
  ) {
    const isFollowing = await this.userPreferencesService.isFollowingOrganizer(req.user.id, organizerId);
    return { isFollowing };
  }

  @Get('organizers/:organizerId/followers-count')
  @ApiOperation({ summary: 'Get follower count for organizer' })
  @ApiParam({ name: 'organizerId', description: 'Organizer UUID' })
  @ApiResponse({ status: 200, description: 'Returns follower count' })
  async getFollowersCount(@Param('organizerId', ParseUUIDPipe) organizerId: string) {
    const count = await this.userPreferencesService.getFollowersCount(organizerId);
    return { count };
  }
}
