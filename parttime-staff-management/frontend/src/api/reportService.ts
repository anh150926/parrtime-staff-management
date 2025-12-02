import api from './axios';
import { ApiResponse } from './authService';

export interface StoreReport {
  storeId: number;
  storeName: string;
  month: string;
  totalStaff: number;
  totalShifts: number;
  totalHoursWorked: number;
  totalPayroll: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

export interface SystemReport {
  month: string;
  totalStores: number;
  totalStaff: number;
  totalManagers: number;
  totalShifts: number;
  totalHoursWorked: number;
  totalPayroll: number;
  totalPendingRequests: number;
  storeReports: StoreReport[];
}

const reportService = {
  getStoreReport: async (storeId: number, month: string): Promise<ApiResponse<StoreReport>> => {
    const response = await api.get<ApiResponse<StoreReport>>(`/reports/store/${storeId}?month=${month}`);
    return response.data;
  },

  getSystemReport: async (month: string): Promise<ApiResponse<SystemReport>> => {
    const response = await api.get<ApiResponse<SystemReport>>(`/reports/system?month=${month}`);
    return response.data;
  },
};

export default reportService;








