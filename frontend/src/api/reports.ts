import api from './client';
import type { ApiResponse, Report } from '../types';

export const reportsApi = {
  list: async (params: { status?: string; page?: number; per_page?: number } = {}) => {
    const res = await api.get<ApiResponse<{ reports: Report[]; total: number; page: number; per_page: number }>>(
      '/admin/reports',
      { params },
    );
    return res.data;
  },
  get: async (id: string) => {
    const res = await api.get<ApiResponse<Report>>(`/admin/reports/${id}`);
    return res.data;
  },
  review: async (id: string, data: { status: 'reviewed' | 'actioned' | 'dismissed'; resolution?: string }) => {
    const res = await api.patch<ApiResponse<Report>>(`/admin/reports/${id}`, data);
    return res.data;
  },
};
