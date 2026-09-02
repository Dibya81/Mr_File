import api from './client';
import type {
  ApiResponse,
  AdminStats,
  PaginatedResponse,
  User,
  UserDetail,
  Document,
  ProcessingJob,
  Share,
  StorageStats,
  SecurityEvent,
  ActivityEvent,
  SystemHealth,
} from '../types';

const listParam = (page: number, perPage: number, filters?: Record<string, string | undefined>) => {
  const params: Record<string, string | number> = { page, per_page: perPage };
  if (filters) {
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== '' && v !== null) params[k] = v;
    }
  }
  return params;
};

export const adminApi = {
  // Overview
  getStats: async () => {
    const res = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return res.data;
  },

  getSystemHealth: async () => {
    const res = await api.get<ApiResponse<SystemHealth>>('/admin/system-health');
    return res.data;
  },

  // Users
  getUsers: async (
    page = 1,
    perPage = 20,
    filters?: { search?: string; role?: 'admin' | 'user'; status?: 'active' | 'inactive' }
  ) => {
    const res = await api.get<PaginatedResponse<User>>('/admin/users', { params: listParam(page, perPage, filters) });
    return res.data;
  },

  getUser: async (id: string) => {
    const res = await api.get<ApiResponse<UserDetail>>(`/admin/users/${id}`);
    return res.data;
  },

  updateUserRole: async (id: string, role: 'admin' | 'user') => {
    const res = await api.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  // Documents
  getDocuments: async (
    page = 1,
    perPage = 20,
    filters?: {
      search?: string;
      type?: string;
      category?: string;
      status?: string;
      locked?: 'true' | 'false';
      shared?: 'true' | 'false';
    }
  ) => {
    const res = await api.get<PaginatedResponse<Document>>('/admin/documents', { params: listParam(page, perPage, filters) });
    return res.data;
  },

  getDocument: async (id: string) => {
    const res = await api.get<ApiResponse<Document>>(`/admin/documents/${id}`);
    return res.data;
  },

  deleteDocument: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/admin/documents/${id}`);
    return res.data;
  },

  // Processing
  getProcessingJobs: async (
    page = 1,
    perPage = 20,
    filters?: { status?: string; type?: string; owner?: string; failure?: 'true' | 'false' }
  ) => {
    const res = await api.get<PaginatedResponse<ProcessingJob>>('/admin/processing', { params: listParam(page, perPage, filters) });
    return res.data;
  },

  getProcessingJob: async (id: string) => {
    const res = await api.get<ApiResponse<ProcessingJob>>(`/admin/processing/${id}`);
    return res.data;
  },

  retryProcessingJob: async (id: string) => {
    const res = await api.post<ApiResponse<ProcessingJob>>(`/admin/processing/${id}/retry`);
    return res.data;
  },

  // Sharing
  getSharing: async (
    page = 1,
    perPage = 20,
    filters?: { search?: string; status?: 'active' | 'revoked' }
  ) => {
    const res = await api.get<PaginatedResponse<Share>>('/admin/sharing', { params: listParam(page, perPage, filters) });
    return res.data;
  },

  // Storage
  getStorage: async () => {
    const res = await api.get<ApiResponse<StorageStats>>('/admin/storage');
    return res.data;
  },

  // Security
  getSecurity: async (page = 1, perPage = 20) => {
    const res = await api.get<PaginatedResponse<SecurityEvent>>('/admin/security', {
      params: { page, per_page: perPage },
    });
    return res.data;
  },

  // Activity
  getActivity: async (page = 1, perPage = 20) => {
    const res = await api.get<PaginatedResponse<ActivityEvent>>('/admin/activity', {
      params: { page, per_page: perPage },
    });
    return res.data;
  },
};
