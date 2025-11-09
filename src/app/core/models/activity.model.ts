export interface Activity {
  id: number;
  groupId: number;
  groupName?: string | null;
  userId: string;
  userName?: string | null;
  activityType: ActivityType;
  description: string;
  metadata?: any;
  targetUserId?: string | null;
  targetUserName?: string | null;
  timestamp: string; // Backend uses 'timestamp' not 'createdAt'
  createdAt?: string; // Keep for backward compatibility
}

export interface ActivityPage {
  content: Activity[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export enum ActivityType {
  GROUP_CREATED = 'GROUP_CREATED',
  MEMBER_ADDED = 'MEMBER_ADDED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  EXPENSE_ADDED = 'EXPENSE_ADDED', // Backend uses EXPENSE_ADDED
  EXPENSE_CREATED = 'EXPENSE_CREATED',
  EXPENSE_UPDATED = 'EXPENSE_UPDATED',
  EXPENSE_DELETED = 'EXPENSE_DELETED',
  PAYMENT_RECORDED = 'PAYMENT_RECORDED',
  SETTLEMENT_COMPLETED = 'SETTLEMENT_COMPLETED'
}

export interface ActivityCreate {
  groupId: number;
  userId: string;
  activityType: ActivityType;
  description: string;
  metadata?: any;
}
