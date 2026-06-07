import {
  Controller,
  Get,
  Post,
  Delete,
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
import { BankAccountsService } from './bank-accounts.service';
import { UpsertBankAccountDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities';

@ApiTags('Bank Accounts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ORGANIZER, UserRole.ADMIN)
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Get('me')
  @ApiOperation({ summary: "Get the current organizer's bank account (IBAN masked)" })
  @ApiResponse({ status: 200, description: 'Returns the bank account or null' })
  getMine(@Request() req) {
    return this.bankAccountsService.findByUser(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update the current organizer bank account' })
  @ApiResponse({ status: 201, description: 'Bank account saved' })
  upsert(@Request() req, @Body() dto: UpsertBankAccountDto) {
    return this.bankAccountsService.upsert(req.user.id, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete the current organizer bank account' })
  @ApiResponse({ status: 200, description: 'Bank account deleted' })
  async remove(@Request() req) {
    await this.bankAccountsService.remove(req.user.id);
    return { message: 'Bank account deleted' };
  }
}
