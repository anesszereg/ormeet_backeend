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
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, TicketStatus } from '../entities';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all tickets' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'orderId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
  @ApiResponse({ status: 200, description: 'Return all tickets' })
  findAll(
    @Query('userId') userId?: string,
    @Query('orderId') orderId?: string,
    @Query('status') status?: TicketStatus,
  ) {
    return this.ticketsService.findAll({ userId, orderId, status });
  }

  @Get('qr/:qrCode')
  @ApiOperation({ summary: 'Get ticket by QR code' })
  @ApiResponse({ status: 200, description: 'Return ticket details' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findByQRCode(@Param('qrCode') qrCode: string) {
    return this.ticketsService.findByQRCode(qrCode);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get tickets for a specific user' })
  @ApiResponse({ status: 200, description: 'Return user tickets' })
  findByUser(@Param('userId') userId: string) {
    return this.ticketsService.findByUser(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({ status: 200, description: 'Return ticket details' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update ticket' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel this ticket' })
  cancel(@Param('id') id: string) {
    return this.ticketsService.cancel(id);
  }

  @Post(':id/use')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark ticket as used' })
  @ApiResponse({ status: 200, description: 'Ticket marked as used' })
  @ApiResponse({ status: 400, description: 'Invalid ticket status' })
  markAsUsed(@Param('id') id: string) {
    return this.ticketsService.markAsUsed(id);
  }

  @Post(':id/transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Transfer ticket to another user' })
  @ApiResponse({ status: 200, description: 'Ticket transferred successfully' })
  @ApiResponse({ status: 400, description: 'Cannot transfer this ticket' })
  transfer(@Param('id') id: string, @Body() body: { newUserId: string }) {
    return this.ticketsService.transfer(id, body.newUserId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete ticket' })
  @ApiResponse({ status: 200, description: 'Ticket deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete used tickets' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
