import api from './client';
import type { ApiResponse, Folder } from '../types';

export const foldersApi = {
  list: async (parentId?: string) => {
    const params = parentId ? { parent_folder_id: parentId } : {};
    const res = await api.get<ApiResponse<{ folders: Folder[]; total: number }>>('/folders', { params });
    return res.data;
  },

  get: async (id: string) => {
    const res = await api.get<ApiResponse<Folder>>(`/folders/${id}`);
    return res.data;
  },

  create: async (data: { name: string; parent_folder_id?: string; visibility?: 'private' | 'password' | 'public' }) => {
    const res = await api.post<ApiResponse<Folder>>('/folders', data);
    return res.data;
  },

  rename: async (id: string, name: string) => {
    const res = await api.patch<ApiResponse<Folder>>(`/folders/${id}`, { name });
    return res.data;
  },

  update: async (id: string, data: { name?: string; visibility?: 'private' | 'password' | 'public' }) => {
    const res = await api.patch<ApiResponse<Folder>>(`/folders/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/folders/${id}`);
    return res.data;
  },
};
