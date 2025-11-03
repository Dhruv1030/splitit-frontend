export interface Group {
  id: number;
  name: string;
  description?: string;
  category: GroupCategory;
  currency: string;
  createdBy: string;
  members: string[];
  createdAt: string;
  updatedAt?: string;
}

export enum GroupCategory {
  HOME = 'HOME',
  TRIP = 'TRIP',
  OFFICE = 'OFFICE',
  SPORTS = 'SPORTS',
  COUPLE = 'COUPLE',
  OTHER = 'OTHER'
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  category: string;
  currency?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  category?: string;
  currency?: string;
}

export interface AddMemberRequest {
  userId: string;
}
