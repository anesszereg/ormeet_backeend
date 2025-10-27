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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities';

@ApiTags('Ticket Types')
@Controller('ticket-types')
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new ticket type' })
  @ApiResponse({ status: 201, description: 'Ticket type created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createTicketTypeDto: CreateTicketTypeDto) {
    return this.ticketTypesService.create(createTicketTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ticket types' })
  @ApiQuery({ name: 'eventId', required: false })
  @ApiResponse({ status: 200, description: 'Return all ticket types' })
  findAll(@Query('eventId') eventId?: string) {
    return this.ticketTypesService.findAll(eventId);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get ticket types for a specific event' })
  @ApiResponse({ status: 200, description: 'Return event ticket types' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.ticketTypesService.findByEvent(eventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket type by ID' })
  @ApiResponse({ status: 200, description: 'Return ticket type details' })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  findOne(@Param('id') id: string) {
    return this.ticketTypesService.findOne(id);
  }

  @Get(':id/available')
  @ApiOperation({ summary: 'Get available quantity for ticket type' })
  @ApiResponse({ status: 200, description: 'Return available quantity' })
  getAvailableQuantity(@Param('id') id: string) {
    return this.ticketTypesService.getAvailableQuantity(id);
  }

  @Get(':id/is-available')
  @ApiOperation({ summary: 'Check if ticket type is available for purchase' })
  @ApiResponse({ status: 200, description: 'Return availability status' })
  isAvailable(@Param('id') id: string) {
    return this.ticketTypesService.isAvailable(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update ticket type' })
  @ApiResponse({ status: 200, description: 'Ticket type updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  update(
    @Param('id') id: string,
    @Body() updateTicketTypeDto: UpdateTicketTypeDto,
  ) {
    return this.ticketTypesService.update(id, updateTicketTypeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete ticket type' })
  @ApiResponse({ status: 200, description: 'Ticket type deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete ticket type with sold tickets' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  remove(@Param('id') id: string) {
    return this.ticketTypesService.remove(id);
  }
}
