import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities';

class TestReminderDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  attendeeName?: string;

  @IsOptional()
  @IsString()
  eventTitle?: string;

  @IsOptional()
  @IsString()
  eventDate?: string;

  @IsOptional()
  @IsString()
  eventLocation?: string;

  @IsOptional()
  @IsString()
  ticketCode?: string;

  @IsOptional()
  @IsString()
  ticketType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(168)
  hoursUntilEvent?: number;
}

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test-reminder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Send a test event reminder email',
    description: `Send a test reminder email to a specific address. Useful for previewing the reminder template.

**Example:**
\`\`\`json
{
  "email": "test@example.com",
  "attendeeName": "John Doe",
  "eventTitle": "Tech Conference 2025",
  "eventDate": "Saturday, June 15, 2025 at 09:00 AM",
  "eventLocation": "Convention Center, New York",
  "ticketCode": "A3K9L2M4P7Q1",
  "ticketType": "VIP Pass",
  "hoursUntilEvent": 24
}
\`\`\`

Only \`email\` is required — all other fields have sensible defaults.`,
  })
  @ApiBody({ type: TestReminderDto })
  @ApiResponse({ status: 200, description: 'Test reminder email sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async sendTestReminder(@Body() dto: TestReminderDto) {
    await this.emailService.sendEventReminder({
      email: dto.email,
      attendeeName: dto.attendeeName || 'Test Attendee',
      eventTitle: dto.eventTitle || 'Sample Event — Test Reminder',
      eventDate: dto.eventDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      eventLocation: dto.eventLocation || 'Convention Center, New York',
      ticketCode: dto.ticketCode || 'TEST12345678',
      ticketType: dto.ticketType || 'General Admission',
      hoursUntilEvent: dto.hoursUntilEvent ?? 24,
    });

    return { message: `Test reminder email sent to ${dto.email}` };
  }
}
