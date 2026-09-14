import { api } from './client';
import { ApiResponse, AuthUser, LoginResponse } from '@/types/auth';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<{ token: string; user: AuthUser }>>(
      '/auth/login',
      { email, password }
    );
    if (!res.data) {
      throw new Error(res.message || 'Login failed');
    }
    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Best effort logout
    }
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await api.get<ApiResponse<{ user: AuthUser }>>('/auth/me');
    if (!res.data?.user) {
      throw new Error('User profile unavailable');
    }
    return res.data.user;
  },
};
