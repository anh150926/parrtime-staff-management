import api from './axios';
import { ApiResponse } from './authService';

export interface TimeLog {
  id: number;
  userId: number;
  userName: string;
  shiftId?: number;
  shiftTitle?: string;
  checkIn: string;
  checkOut?: string;
  durationMinutes?: number;
  durationFormatted?: string;
  recordedBy: 'SYSTEM' | 'MANUAL';
  createdAt: string;
}

export interface ManualTimeLogRequest {
  userId: number;
  shiftId?: number;
  checkIn: string;
  checkOut: string;
}

const timeLogService = {
  checkIn: async (shiftId?: number): Promise<ApiResponse<TimeLog>> => {
    const response = await api.post<ApiResponse<TimeLog>>('/time/checkin', { shiftId });
    return response.data;
  },

  checkOut: async (): Promise<ApiResponse<TimeLog>> => {
    const response = await api.post<ApiResponse<TimeLog>>('/time/checkout');
    return response.data;
  },

  getCurrentCheckIn: async (): Promise<ApiResponse<TimeLog | null>> => {
    const response = await api.get<ApiResponse<TimeLog | null>>('/time/current');
    return response.data;
  },

  getByUser: async (userId: number, startDate?: string, endDate?: string): Promise<ApiResponse<TimeLog[]>> => {
    let url = `/time/user/${userId}`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get<ApiResponse<TimeLog[]>>(url);
    return response.data;
  },

  getByStore: async (storeId: number, startDate: string, endDate: string): Promise<ApiResponse<TimeLog[]>> => {
    const response = await api.get<ApiResponse<TimeLog[]>>(
      `/time/store/${storeId}?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  createManual: async (data: ManualTimeLogRequest): Promise<ApiResponse<TimeLog>> => {
    const response = await api.post<ApiResponse<TimeLog>>('/time/manual', data);
    return response.data;
  },
};

export default timeLogService;








