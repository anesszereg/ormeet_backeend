import api from './api';

// ========== Types ==========

export interface BankAccount {
  id: string;
  accountHolderName: string;
  bankName: string;
  country: string;
  iban: string; // returned masked from the backend
  swiftBic: string;
  status: 'pending' | 'verified';
  createdAt: string;
  updatedAt: string;
}

export interface UpsertBankAccountDto {
  accountHolderName: string;
  bankName: string;
  country: string;
  iban: string;
  swiftBic: string;
  organizationId?: string;
}

// ========== Service ==========

class BankAccountService {
  async getMine(): Promise<BankAccount | null> {
    const response = await api.get<BankAccount | null>('/bank-accounts/me');
    return response.data;
  }

  async upsert(data: UpsertBankAccountDto): Promise<BankAccount> {
    const response = await api.post<BankAccount>('/bank-accounts', data);
    return response.data;
  }

  async remove(): Promise<void> {
    await api.delete('/bank-accounts/me');
  }
}

export default new BankAccountService();
