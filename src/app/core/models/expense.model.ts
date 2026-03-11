export interface Expense {
  id: number;
  description: string;
  amount: number;
  currency: string;
  groupId?: number;          // null for FRIEND expenses
  friendUserId?: string;     // The other user in a FRIEND expense
  expenseType: ExpenseType;
  paidBy: string;
  paidByName?: string;
  createdBy?: string;  // User ID who recorded the expense
  category: ExpenseCategory;
  splitType: SplitType;
  date?: string;
  createdAt: string;
  updatedAt?: string;
  groupName?: string;
  participants?: ExpenseParticipant[];
}

export enum ExpenseType {
  GROUP = 'GROUP',
  FRIEND = 'FRIEND'
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
  friendUserId?: string;     // For FRIEND expenses
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
