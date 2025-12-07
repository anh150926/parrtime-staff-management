import api from './axios';
import { ApiResponse } from './authService';

export interface ShiftAssignment {
  id: number;
  shiftId: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: 'ASSIGNED' | 'CONFIRMED' | 'DECLINED';
  assignedAt: string;
}

export interface Shift {
  id: number;
  storeId: number;
  storeName: string;
  title: string;
  startDatetime: string;
  endDatetime: string;
  requiredSlots: number;
  assignedCount: number;
  confirmedCount: number;
  createdById?: number;
  createdByName?: string;
  assignments?: ShiftAssignment[];
  createdAt: string;
}

export interface CreateShiftRequest {
  title: string;
  startDatetime: string;
  endDatetime: string;
  requiredSlots?: number;
}

export interface AssignShiftRequest {
  userIds: number[];
}

const shiftService = {
  getByStore: async (storeId: number, startDate?: string, endDate?: string): Promise<ApiResponse<Shift[]>> => {
    let url = `/stores/${storeId}/shifts`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get<ApiResponse<Shift[]>>(url);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Shift>> => {
    const response = await api.get<ApiResponse<Shift>>(`/shifts/${id}`);
    return response.data;
  },

  create: async (storeId: number, data: CreateShiftRequest): Promise<ApiResponse<Shift>> => {
    const response = await api.post<ApiResponse<Shift>>(`/stores/${storeId}/shifts`, data);
    return response.data;
  },

  update: async (id: number, data: CreateShiftRequest): Promise<ApiResponse<Shift>> => {
    const response = await api.put<ApiResponse<Shift>>(`/shifts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/shifts/${id}`);
    return response.data;
  },

  assignStaff: async (shiftId: number, data: AssignShiftRequest): Promise<ApiResponse<Shift>> => {
    const response = await api.post<ApiResponse<Shift>>(`/shifts/${shiftId}/assign`, data);
    return response.data;
  },

  removeAssignment: async (shiftId: number, userId: number): Promise<ApiResponse<Shift>> => {
    const response = await api.delete<ApiResponse<Shift>>(`/shifts/${shiftId}/assignments/${userId}`);
    return response.data;
  },

  updateAssignment: async (shiftId: number, status: 'CONFIRMED' | 'DECLINED'): Promise<ApiResponse<ShiftAssignment>> => {
    const response = await api.put<ApiResponse<ShiftAssignment>>(`/shifts/${shiftId}/assignment`, { status });
    return response.data;
  },

  getMyShifts: async (startDate?: string): Promise<ApiResponse<Shift[]>> => {
    let url = '/my-shifts';
    if (startDate) url += `?startDate=${startDate}`;
    
    const response = await api.get<ApiResponse<Shift[]>>(url);
    return response.data;
  },

  getShiftsForRegistration: async (storeId: number, startDate?: string, endDate?: string): Promise<ApiResponse<Shift[]>> => {
    let url = `/stores/${storeId}/shifts/for-registration`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get<ApiResponse<Shift[]>>(url);
    return response.data;
  },

  registerForShift: async (shiftId: number): Promise<ApiResponse<Shift>> => {
    const response = await api.post<ApiResponse<Shift>>(`/shifts/${shiftId}/register`);
    return response.data;
  },
};

export default shiftService;








