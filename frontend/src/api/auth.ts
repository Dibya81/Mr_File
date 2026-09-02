import api from './client';
import type { ApiResponse, User } from '../types';

export const authApi = {
  signup: async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    confirm_password: string;
  }) => {
    const res = await api.post<ApiResponse<User>>('/auth/signup', data);
    return res.data;
  },

  login: async (data: { identifier: string; password: string }) => {
    const res = await api.post<ApiResponse<User>>('/auth/login', data);
    return res.data;
  },

  logout: async () => {
    const res = await api.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  checkUsername: async (username: string) => {
    const res = await api.get<ApiResponse<{ available: boolean; username: string }>>(
      `/users/check-username?username=${encodeURIComponent(username)}`
    );
    return res.data;
  },
};
