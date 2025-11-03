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
  userId: string;
  email: string;
  name: string;
}
