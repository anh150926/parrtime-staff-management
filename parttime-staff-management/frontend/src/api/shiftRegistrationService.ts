import api from "./axios";
import { ApiResponse } from "./authService";

export interface ShiftTemplate {
  id: number;
  storeId: number;
  storeName: string;
  title: string;
  shiftType: "MORNING" | "AFTERNOON" | "EVENING";
  dayOfWeek: number; // 1=Monday, 7=Sunday
  startTime: string;
  endTime: string;
  requiredSlots: number;
  createdById?: number;
  createdByName?: string;
}

export interface ShiftRegistration {
  id: number;
  shiftId: number;
  shiftTitle: string;
  userId: number;
  userName: string;
  registrationDate: string;
  status: "REGISTERED" | "CANCELLED";
  registeredAt: string;
  cancelledAt?: string;
}

export interface CreateShiftTemplateRequest {
  title: string;
  shiftType: "MORNING" | "AFTERNOON" | "EVENING";
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  requiredSlots?: number;
}

export interface RegisterShiftRequest {
  shiftTemplateId: number;
  registrationDate: string; // YYYY-MM-DD
}

const shiftRegistrationService = {
  // Shift Templates
  getShiftTemplates: async (storeId: number): Promise<ApiResponse<ShiftTemplate[]>> => {
    const response = await api.get<ApiResponse<ShiftTemplate[]>>(`/stores/${storeId}/shift-templates`);
    return response.data;
  },

  createShiftTemplate: async (storeId: number, data: CreateShiftTemplateRequest): Promise<ApiResponse<ShiftTemplate>> => {
    const response = await api.post<ApiResponse<ShiftTemplate>>(`/stores/${storeId}/shift-templates`, data);
    return response.data;
  },

  // Registrations
  registerShift: async (templateId: number, data: RegisterShiftRequest): Promise<ApiResponse<ShiftRegistration>> => {
    const response = await api.post<ApiResponse<ShiftRegistration>>(`/shift-templates/${templateId}/register`, data);
    return response.data;
  },

  getRegistrationsForWeek: async (storeId: number, weekStart: string): Promise<ApiResponse<ShiftRegistration[]>> => {
    const response = await api.get<ApiResponse<ShiftRegistration[]>>(`/shift-registrations/week`, {
      params: { storeId, weekStart }
    });
    return response.data;
  },

  getMyRegistrationsForWeek: async (weekStart: string): Promise<ApiResponse<ShiftRegistration[]>> => {
    const response = await api.get<ApiResponse<ShiftRegistration[]>>(`/my-registrations/week`, {
      params: { weekStart }
    });
    return response.data;
  },

  getRegisteredUsersForShift: async (templateId: number, date: string): Promise<ApiResponse<ShiftRegistration[]>> => {
    const response = await api.get<ApiResponse<ShiftRegistration[]>>(`/shift-templates/${templateId}/registrations`, {
      params: { date }
    });
    return response.data;
  },

  cancelRegistration: async (registrationId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/shift-registrations/${registrationId}`);
    return response.data;
  },
};

export default shiftRegistrationService;
