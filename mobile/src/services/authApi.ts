import { api } from './api';
import type { TokenResponse, User } from '../types/api';

export interface SignupPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  signup: (body: SignupPayload) => api.post<User>('/auth/signup', body),
  login: (body: LoginPayload) => api.post<TokenResponse>('/auth/login', body),
  me: () => api.get<User>('/auth/me'),
};
