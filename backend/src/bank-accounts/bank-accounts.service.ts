import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount, BankAccountStatus } from '../entities';
import { UpsertBankAccountDto } from './dto';

export interface BankAccountResponse {
  id: string;
  accountHolderName: string;
  bankName: string;
  country: string;
  iban: string;
  swiftBic: string;
  status: BankAccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  // Mask IBAN so sensitive data is never returned in full.
  private maskIban(iban: string): string {
    if (!iban) return '';
    const last4 = iban.slice(-4);
    return `****${last4}`;
  }

  private toResponse(account: BankAccount): BankAccountResponse {
    return {
      id: account.id,
      accountHolderName: account.accountHolderName,
      bankName: account.bankName,
      country: account.country,
      iban: this.maskIban(account.iban),
      swiftBic: account.swiftBic,
      status: account.status,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  async findByUser(userId: string): Promise<BankAccountResponse | null> {
    const account = await this.bankAccountRepository.findOne({ where: { userId } });
    return account ? this.toResponse(account) : null;
  }

  // One bank account per organizer (user). Upsert keeps it simple for the UI.
  async upsert(userId: string, dto: UpsertBankAccountDto): Promise<BankAccountResponse> {
    let account = await this.bankAccountRepository.findOne({ where: { userId } });

    if (account) {
      Object.assign(account, {
        accountHolderName: dto.accountHolderName,
        bankName: dto.bankName,
        country: dto.country,
        iban: dto.iban,
        swiftBic: dto.swiftBic,
        organizationId: dto.organizationId ?? account.organizationId,
        // Editing bank details requires re-verification.
        status: BankAccountStatus.PENDING,
      });
    } else {
      account = this.bankAccountRepository.create({
        userId,
        accountHolderName: dto.accountHolderName,
        bankName: dto.bankName,
        country: dto.country,
        iban: dto.iban,
        swiftBic: dto.swiftBic,
        organizationId: dto.organizationId,
        status: BankAccountStatus.PENDING,
      });
    }

    const saved = await this.bankAccountRepository.save(account);
    return this.toResponse(saved);
  }

  async remove(userId: string): Promise<void> {
    const account = await this.bankAccountRepository.findOne({ where: { userId } });
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }
    await this.bankAccountRepository.remove(account);
  }
}
