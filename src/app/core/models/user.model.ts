export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  phoneNumber?: string;
  avatar?: string;
  friendIds: string[];
  defaultCurrency: string;
  createdAt: string;
  updatedAt?: string;
  emailVerified: boolean;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  receiverName: string;
  receiverEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

export interface SendFriendRequest {
  receiverEmail?: string;
  receiverId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  defaultCurrency?: string;
}

export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    userId?: string;
    email: string;
    name: string;
    phone?: string;
    phoneNumber?: string;
    defaultCurrency?: string;
    friendIds?: string[];
    createdAt?: string;
    emailVerified?: boolean;
  };
  userId?: string;
  email?: string;
  name?: string;
}
