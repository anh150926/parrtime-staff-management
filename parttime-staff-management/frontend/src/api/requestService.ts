import api from './axios';
import { ApiResponse } from './authService';

export interface Request {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  storeId?: number;
  storeName?: string;
  type: 'LEAVE' | 'SHIFT_CHANGE';
  startDatetime: string;
  endDatetime: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedById?: number;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface CreateRequestRequest {
  type: 'LEAVE' | 'SHIFT_CHANGE';
  startDatetime: string;
  endDatetime: string;
  reason?: string;
}

export interface ReviewRequestRequest {
  status: 'APPROVED' | 'REJECTED';
  note?: string;
}

const requestService = {
  getAll: async (status?: string): Promise<ApiResponse<Request[]>> => {
    let url = '/requests';
    if (status) url += `?status=${status}`;
    
    const response = await api.get<ApiResponse<Request[]>>(url);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Request>> => {
    const response = await api.get<ApiResponse<Request>>(`/requests/${id}`);
    return response.data;
  },

  create: async (data: CreateRequestRequest): Promise<ApiResponse<Request>> => {
    const response = await api.post<ApiResponse<Request>>('/requests', data);
    return response.data;
  },

  review: async (id: number, data: ReviewRequestRequest): Promise<ApiResponse<Request>> => {
    const response = await api.put<ApiResponse<Request>>(`/requests/${id}/review`, data);
    return response.data;
  },

  getPendingCount: async (): Promise<ApiResponse<number>> => {
    const response = await api.get<ApiResponse<number>>('/requests/pending-count');
    return response.data;
  },
};

export default requestService;








