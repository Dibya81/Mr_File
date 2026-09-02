import api from './client';
import type { ApiResponse, ProcessingJob, PaginatedResponse } from '../types';

export const processingApi = {
  getHistory: async (page = 1, perPage = 20) => {
    const res = await api.get<PaginatedResponse<ProcessingJob>>('/documents/history', {
      params: { page, per_page: perPage },
    });
    return res.data;
  },
};
