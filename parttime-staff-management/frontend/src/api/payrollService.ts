import api from './axios';
import { ApiResponse } from './authService';

export interface Payroll {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  storeId?: number;
  storeName?: string;
  month: string;
  totalHours: number;
  hourlyRate?: number;
  grossPay: number;
  adjustments: number;
  adjustmentNote?: string;
  netPay: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  createdAt: string;
}

export interface UpdatePayrollRequest {
  adjustments?: number;
  adjustmentNote?: string;
  status?: 'DRAFT' | 'APPROVED' | 'PAID';
}

const payrollService = {
  generate: async (month: string, storeId?: number): Promise<ApiResponse<Payroll[]>> => {
    let url = `/payrolls/generate?month=${month}`;
    if (storeId) url += `&storeId=${storeId}`;
    
    const response = await api.post<ApiResponse<Payroll[]>>(url);
    return response.data;
  },

  getByUserAndMonth: async (userId: number, month: string): Promise<ApiResponse<Payroll>> => {
    const response = await api.get<ApiResponse<Payroll>>(`/payrolls/user/${userId}?month=${month}`);
    return response.data;
  },

  getByStoreAndMonth: async (storeId: number, month: string): Promise<ApiResponse<Payroll[]>> => {
    const response = await api.get<ApiResponse<Payroll[]>>(`/payrolls/store/${storeId}?month=${month}`);
    return response.data;
  },

  getByMonth: async (month: string): Promise<ApiResponse<Payroll[]>> => {
    const response = await api.get<ApiResponse<Payroll[]>>(`/payrolls?month=${month}`);
    return response.data;
  },

  update: async (id: number, data: UpdatePayrollRequest): Promise<ApiResponse<Payroll>> => {
    const response = await api.put<ApiResponse<Payroll>>(`/payrolls/${id}`, data);
    return response.data;
  },
};

export default payrollService;








