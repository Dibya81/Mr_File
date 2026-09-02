import api from './client';
import type { ApiResponse, Document, PaginatedResponse } from '../types';

export const documentsApi = {
  list: async (params: {
    folder_id?: string;
    search?: string;
    file_type?: string;
    category?: string;
    status?: string;
    visibility?: string;
    is_starred?: boolean;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    per_page?: number;
  } = {}) => {
    const res = await api.get<PaginatedResponse<Document>>('/documents', { params });
    return res.data;
  },

  recent: async (per_page: number = 20) => {
    const res = await api.get<PaginatedResponse<Document>>('/documents', {
      params: { sort_by: 'updated_at', sort_order: 'desc', per_page },
    });
    return res.data;
  },

  stats: async () => {
    const res = await api.get<{
      success: boolean;
      data: {
        total_count: number;
        total_size: number;
        processing_count: number;
        completed_count: number;
        starred_count: number;
      };
    }>('/documents/stats/summary');
    return res.data;
  },

  starred: async (per_page: number = 100) => {
    const res = await api.get<PaginatedResponse<Document>>('/documents', {
      params: { is_starred: true, sort_by: 'updated_at', sort_order: 'desc', per_page },
    });
    return res.data;
  },

  toggleStar: async (id: string, isStarred: boolean) => {
    const res = await api.patch<ApiResponse<Document>>(`/documents/${id}/metadata`, {
      is_starred: isStarred,
      starred_at: isStarred ? new Date().toISOString() : null,
    });
    return res.data;
  },

  get: async (id: string) => {
    const res = await api.get<ApiResponse<Document>>(`/documents/${id}`);
    return res.data;
  },

  upload: async (file: File, folderId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folder_id', folderId);

    const res = await api.post<ApiResponse<any>>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  update: async (
    id: string,
    data: {
      original_filename?: string;
      folder_id?: string;
      visibility?: 'private' | 'password' | 'public';
      public_title?: string | null;
      public_password?: string | null;
    },
  ) => {
    const res = await api.patch<ApiResponse<Document>>(`/documents/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/documents/${id}`);
    return res.data;
  },

  download: async (id: string, password?: string) => {
    const body = password ? { password } : {};
    const res = await api.post<{ success: boolean; data: { url: string; filename: string }; message: string }>(
      `/documents/${id}/download`,
      body,
    );
    const payload = res.data?.data;
    if (payload && payload.url) {
      // Cross-origin signed URLs ignore the `download` attribute.
      // Fetch the bytes, then create a same-origin blob URL to force a real download.
      const fileRes = await fetch(payload.url);
      if (!fileRes.ok) throw new Error(`Download failed (${fileRes.status})`);
      const blob = await fileRes.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = payload.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      return payload;
    }
    throw new Error('No download URL in response');
  },

  lock: async (id: string, password: string) => {
    const res = await api.post<ApiResponse<null>>(`/documents/${id}/lock`, { password });
    return res.data;
  },

  unlock: async (id: string, password: string) => {
    const res = await api.post<ApiResponse<null>>(`/documents/${id}/unlock`, { password });
    return res.data;
  },
};
