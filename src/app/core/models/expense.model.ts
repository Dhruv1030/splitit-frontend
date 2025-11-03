export interface Expense {
  id: number;
  description: string;
  amount: number;
  currency: string;
  groupId: number;
  paidBy: string;
  paidByName?: string;
  category: ExpenseCategory;
  splitType: SplitType;
  date?: string;
  createdAt: string;
  updatedAt?: string;
  participants?: ExpenseParticipant[];
}

export interface ExpenseParticipant {
  userId: string;
  amount: number;
  paid: boolean;
}

export enum SplitType {
  EQUAL = 'EQUAL',
  EXACT = 'EXACT',
  PERCENTAGE = 'PERCENTAGE'
}

export enum ExpenseCategory {
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  ACCOMMODATION = 'ACCOMMODATION',
  ENTERTAINMENT = 'ENTERTAINMENT',
  UTILITIES = 'UTILITIES',
  SHOPPING = 'SHOPPING',
  OTHER = 'OTHER'
}

export interface CreateExpenseRequest {
  description: string;
  amount: number;
  currency?: string;
  groupId?: number;
  paidBy: string;
  category: string;
  splitType: string;
  participantIds?: string[];
  exactAmounts?: { [key: string]: number };
  percentages?: { [key: string]: number };
  notes?: string;
  receiptUrl?: string;
}

export interface UpdateExpenseRequest {
  description?: string;
  amount?: number;
  currency?: string;
  category?: string;
  splitType?: string;
  participantIds?: string[];
  exactAmounts?: { [key: string]: number };
  percentages?: { [key: string]: number };
}

export interface UserBalance {
  userId: string;
  totalOwed: number;
  totalOwing: number;
  netBalance: number;
  currency: string;
  balances: BalanceDetail[];
}

export interface BalanceDetail {
  withUserId: string;
  withUserName: string;
  amount: number;
  type: 'OWES' | 'OWED';
}
