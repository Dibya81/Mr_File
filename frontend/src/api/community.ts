import api from './client';
import type { ApiResponse, CommunityRequest, CommunityOffer, CommunityTransfer } from '../types';

interface Paginated<T> {
  data: T;
}

export const communityApi = {
  requests: {
    list: async (params: { status?: string; page?: number; per_page?: number } = {}) => {
      const res = await api.get<Paginated<{ requests: CommunityRequest[]; total: number; page: number; per_page: number }>>(
        '/community/requests',
        { params },
      );
      return res.data;
    },
    mine: async (params: { status?: string; page?: number; per_page?: number } = {}) => {
      const res = await api.get<Paginated<{ requests: CommunityRequest[]; total: number; page: number; per_page: number }>>(
        '/community/my/requests',
        { params },
      );
      return res.data;
    },
    create: async (data: { title: string; description?: string; document_type?: string }) => {
      const res = await api.post<ApiResponse<CommunityRequest>>('/community/requests', data);
      return res.data;
    },
    get: async (id: string) => {
      const res = await api.get<ApiResponse<CommunityRequest & { offers: CommunityOffer[] }>>(
        `/community/requests/${id}`,
      );
      return res.data;
    },
    cancel: async (id: string) => {
      const res = await api.delete<ApiResponse<{ id: string; status: string }>>(`/community/requests/${id}`);
      return res.data;
    },
  },
  offers: {
    create: async (requestId: string, data: { document_id: string; message?: string }) => {
      const res = await api.post<ApiResponse<CommunityOffer>>(`/community/requests/${requestId}/offers`, data);
      return res.data;
    },
    listForRequest: async (requestId: string) => {
      const res = await api.get<ApiResponse<{ offers: CommunityOffer[] }>>(
        `/community/requests/${requestId}/offers`,
      );
      return res.data;
    },
    mine: async () => {
      const res = await api.get<ApiResponse<{ offers: CommunityOffer[] }>>('/community/my/offers');
      return res.data;
    },
    accept: async (offerId: string) => {
      const res = await api.post<ApiResponse<CommunityTransfer>>(`/community/offers/${offerId}/accept`);
      return res.data;
    },
    decline: async (offerId: string) => {
      const res = await api.post<ApiResponse<CommunityOffer>>(`/community/offers/${offerId}/decline`);
      return res.data;
    },
    withdraw: async (offerId: string) => {
      const res = await api.delete<ApiResponse<CommunityOffer>>(`/community/offers/${offerId}`);
      return res.data;
    },
  },
  transfers: {
    list: async (params: { page?: number; per_page?: number } = {}) => {
      const res = await api.get<Paginated<{ transfers: CommunityTransfer[]; total: number; page: number; per_page: number }>>(
        '/community/transfers',
        { params },
      );
      return res.data;
    },
    receive: async (transferId: string) => {
      const res = await api.post<ApiResponse<{ id: string; original_filename: string; folder_id: string | null }>>(
        `/community/transfers/${transferId}/receive`,
      );
      return res.data;
    },
    decline: async (transferId: string) => {
      const res = await api.post<ApiResponse<CommunityTransfer>>(`/community/transfers/${transferId}/decline`);
      return res.data;
    },
  },
  saveToWorkspace: async (documentId: string) => {
    const res = await api.post<ApiResponse<{ id: string; original_filename: string; folder_id: string | null }>>(
      `/community/save-to-workspace/${documentId}`,
    );
    return res.data;
    },
  reports: {
    create: async (data: { reason: string; details?: string; reported_user_id?: string; reported_document_id?: string }) => {
      const res = await api.post<ApiResponse<{ id: string; status: string }>>('/community/reports', data);
      return res.data;
    },
  },
};
