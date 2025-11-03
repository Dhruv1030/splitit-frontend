export interface Settlement {
  id: number;
  groupId: number;
  payerId: string;
  payerName?: string;
  payeeId: string;
  payeeName?: string;
  amount: number;
  currency: string;
  status: SettlementStatus;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  settledAt?: string;
  recordedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export enum SettlementStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface SettlementSuggestion {
  from: string;
  to: string;
  amount: number;
  currency: string;
}

export interface GroupBalance {
  groupId: number;
  balances: Array<{
    userId: string;
    netBalance: number;
  }>;
  suggestions: SettlementSuggestion[];
}

export interface RecordSettlementRequest {
  groupId: number;
  payerId: string;
  payeeId: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}
