import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to the newsletter' })
  @ApiBody({ type: SubscribeNewsletterDto })
  @ApiResponse({ status: 201, description: 'Subscribed successfully' })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  async subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(dto);
  }
}
