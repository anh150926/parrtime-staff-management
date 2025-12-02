import api from './axios';
import { ApiResponse } from './authService';

export interface Store {
  id: number;
  name: string;
  address: string;
  openingTime?: string;
  closingTime?: string;
  managerId?: number;
  managerName?: string;
  staffCount: number;
  createdAt: string;
}

export interface CreateStoreRequest {
  name: string;
  address: string;
  openingTime?: string;
  closingTime?: string;
  managerId?: number;
}

export interface UpdateStoreRequest {
  name?: string;
  address?: string;
  openingTime?: string;
  closingTime?: string;
  managerId?: number;
}

const storeService = {
  getAll: async (): Promise<ApiResponse<Store[]>> => {
    const response = await api.get<ApiResponse<Store[]>>('/stores');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Store>> => {
    const response = await api.get<ApiResponse<Store>>(`/stores/${id}`);
    return response.data;
  },

  create: async (data: CreateStoreRequest): Promise<ApiResponse<Store>> => {
    const response = await api.post<ApiResponse<Store>>('/stores', data);
    return response.data;
  },

  update: async (id: number, data: UpdateStoreRequest): Promise<ApiResponse<Store>> => {
    const response = await api.put<ApiResponse<Store>>(`/stores/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/stores/${id}`);
    return response.data;
  },
};

export default storeService;








