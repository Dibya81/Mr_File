import api from './client';
import type { ApiResponse, Share, PaginatedResponse } from '../types';

export const sharesApi = {
  share: async (documentId: string, data: { username: string; permission: string }) => {
    const res = await api.post<ApiResponse<Share>>(`/documents/${documentId}/shares`, data);
    return res.data;
  },

  getDocumentShares: async (documentId: string) => {
    const res = await api.get<ApiResponse<{ shares: any[] }>>(`/documents/${documentId}/shares`);
    return res.data;
  },

  getSharedWithMe: async (page = 1, perPage = 20) => {
    const res = await api.get<PaginatedResponse<Share>>('/shared-with-me', {
      params: { page, per_page: perPage },
    });
    return res.data;
  },

  revoke: async (documentId: string, shareId: string) => {
    const res = await api.delete<ApiResponse<null>>(`/documents/${documentId}/shares/${shareId}`);
    return res.data;
  },
};
