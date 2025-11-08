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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, CreateEventEnhancedDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole, EventStatus } from '../entities';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create a comprehensive event',
    description: `Create an event with all features:

**Features:**
- ✅ Recurring events (daily, weekly, monthly)
- ✅ Multiple location types (physical, online, TBA)
- ✅ Rich media (images + videos)
- ✅ Event guidelines (age, refund, accessibility, parking, etc.)
- ✅ Participants (speakers, performers, sponsors)
- ✅ Custom locations or venue selection
- ✅ **Create tickets with the event** (NEW!)

**Example for Physical One-Time Event:**
\`\`\`json
{
  "title": "Tech Conference 2025",
  "type": "conference",
  "shortDescription": "Annual tech conference",
  "organizerId": "org-uuid",
  "dateType": "one_time",
  "startAt": "2025-06-15T09:00:00Z",
  "endAt": "2025-06-15T18:00:00Z",
  "locationType": "physical",
  "venueId": "venue-uuid",
  "images": ["https://example.com/banner.jpg"],
  "speakers": [
    {
      "name": "Dr. Jane Smith",
      "role": "Keynote Speaker",
      "bio": "AI Expert",
      "image": "https://example.com/jane.jpg"
    }
  ],
  "guidelines": {
    "ageRequirement": "18+",
    "refundPolicy": "Full refund 7 days before event",
    "parkingInfo": "Free parking in Lot A"
  },
  "tickets": [
    {
      "name": "General Admission",
      "type": "general",
      "quantityTotal": 200,
      "price": 79.99,
      "maxPerOrder": 5,
      "ticketBenefits": ["Entry to event", "Event swag bag", "Lunch included"]
    },
    {
      "name": "VIP Pass",
      "type": "vip",
      "quantityTotal": 50,
      "price": 299.99,
      "maxPerOrder": 2,
      "ticketBenefits": ["Priority entry", "VIP lounge access", "Meet & greet with speakers", "Premium seating"]
    }
  ]
}
\`\`\`

**Example for Recurring Online Event:**
\`\`\`json
{
  "title": "Weekly Webinar Series",
  "type": "webinar",
  "shortDescription": "Weekly tech talks",
  "organizerId": "org-uuid",
  "dateType": "multiple",
  "recurringPattern": "weekly",
  "recurringCount": 10,
  "startAt": "2025-06-01T14:00:00Z",
  "endAt": "2025-06-01T15:00:00Z",
  "locationType": "online",
  "onlineLink": "https://zoom.us/j/123456789",
  "onlineInstructions": "Join 15 minutes early"
}
\`\`\`

**Example with Custom Location:**
\`\`\`json
{
  "title": "Community Meetup",
  "type": "networking",
  "shortDescription": "Monthly networking event",
  "organizerId": "org-uuid",
  "dateType": "one_time",
  "startAt": "2025-06-20T18:00:00Z",
  "endAt": "2025-06-20T21:00:00Z",
  "locationType": "physical",
  "customLocation": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "postalCode": "10001",
    "country": "USA"
  }
}
\`\`\`
    `
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Event created successfully',
    schema: {
      example: {
        id: 'uuid',
        title: 'Tech Conference 2025',
        type: 'conference',
        dateType: 'one_time',
        locationType: 'physical',
        speakers: [{name: 'Dr. Jane Smith', role: 'Keynote Speaker'}],
        guidelines: {ageRequirement: '18+', refundPolicy: 'Full refund 7 days before'},
        status: 'draft',
        createdAt: '2025-11-08T00:00:00Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Validation failed. Common errors: Missing recurringPattern for MULTIPLE events, Missing location for PHYSICAL events, Missing onlineLink for ONLINE events' 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  create(@Body() createEventDto: CreateEventEnhancedDto, @CurrentUser() user: User) {
    return this.eventsService.createEnhanced(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with optional filters' })
  @ApiQuery({ name: 'status', enum: EventStatus, required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'organizerId', required: false })
  @ApiResponse({ status: 200, description: 'List of events' })
  findAll(
    @Query('status') status?: EventStatus,
    @Query('category') category?: string,
    @Query('organizerId') organizerId?: string,
  ) {
    return this.eventsService.findAll({ status, category, organizerId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update event (Organizer/Admin only)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete event (Organizer/Admin only)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Publish event (Organizer/Admin only)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Event published successfully' })
  @ApiResponse({ status: 400, description: 'Event already published' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.publish(id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel event (Organizer/Admin only)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Event cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.cancel(id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Increment event view count' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'View count incremented' })
  async incrementViews(@Param('id', ParseUUIDPipe) id: string) {
    await this.eventsService.incrementViews(id);
    return { message: 'View count incremented' };
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add event to favorites (Authenticated)' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Favorite count incremented' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async incrementFavorites(@Param('id', ParseUUIDPipe) id: string) {
    await this.eventsService.incrementFavorites(id);
    return { message: 'Favorite count incremented' };
  }
}
