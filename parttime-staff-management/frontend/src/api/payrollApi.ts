/*
 * file: frontend/src/api/payrollApi.ts
 *
 * File service cho API Module 3 (Tính lương).
 */

import axiosClient from "./axiosClient";
import {
  PayrollDetailResponse,
  PayrollSummaryResponse,
} from "../models/Payroll";

interface PayrollRangeRequest {
  startDate: string;
  endDate: string;
}

export const payrollApi = {
  calculatePayroll: (
    startDate: string,
    endDate: string
  ): Promise<PayrollSummaryResponse[]> => {
    const data: PayrollRangeRequest = { startDate, endDate };
    return axiosClient
      .post<PayrollSummaryResponse[]>("/payroll/calculate", data)
      .then((response) => response.data);
  },

  getPayrollSummary: (
    startDate: string,
    endDate: string
  ): Promise<PayrollSummaryResponse[]> => {
    return axiosClient
      .get<PayrollSummaryResponse[]>("/payroll/summary", {
        params: { startDate, endDate },
      })
      .then((response) => response.data);
  },

  getPayrollDetail: (
    employeeId: number,
    startDate: string,
    endDate: string
  ): Promise<PayrollDetailResponse[]> => {
    return axiosClient
      .get<PayrollDetailResponse[]>(`/payroll/detail/${employeeId}`, {
        params: { startDate, endDate },
      })
      .then((response) => response.data);
  },
};
