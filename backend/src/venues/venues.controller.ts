import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseFloatPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { CreateVenueDto, UpdateVenueDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities';

@ApiTags('Venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new venue' })
  @ApiResponse({ status: 201, description: 'Venue created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createVenueDto: CreateVenueDto) {
    return this.venuesService.create(createVenueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all venues' })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'minCapacity', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all venues' })
  findAll(
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('minCapacity', new ParseIntPipe({ optional: true }))
    minCapacity?: number,
  ) {
    return this.venuesService.findAll({ city, country, minCapacity });
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find venues nearby a location' })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Radius in kilometers (default: 50)' })
  @ApiResponse({ status: 200, description: 'Return nearby venues' })
  findNearby(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query('radius', new ParseFloatPipe({ optional: true })) radius?: number,
  ) {
    return this.venuesService.findNearby(latitude, longitude, radius);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get venue by ID' })
  @ApiResponse({ status: 200, description: 'Return venue details' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update venue' })
  @ApiResponse({ status: 200, description: 'Venue updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  update(@Param('id') id: string, @Body() updateVenueDto: UpdateVenueDto) {
    return this.venuesService.update(id, updateVenueDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete venue' })
  @ApiResponse({ status: 200, description: 'Venue deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
