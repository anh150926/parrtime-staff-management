import axiosClient from "./axiosClient";
import {
  PayrollAdjustmentDto,
  PayrollAdjustmentRequest,
  PayrollCalculationRequest,
  PayrollDto,
} from "../models/Payroll";

export const payrollApi = {
  // Manager: Tính lương (hoặc tính lại)
  calculatePayroll: async (
    data: PayrollCalculationRequest
  ): Promise<PayrollDto[]> => {
    const response = await axiosClient.post<PayrollDto[]>(
      "/payroll/calculate",
      data
    );
    return response.data;
  },

  // Manager: Xem bảng lương cơ sở theo tháng
  getBranchPayroll: async (
    month: number,
    year: number
  ): Promise<PayrollDto[]> => {
    const response = await axiosClient.get<PayrollDto[]>(
      `/payroll/branch?month=${month}&year=${year}`
    );
    return response.data;
  },

  // Staff: Xem lương của tôi
  getMyPayroll: async (month: number, year: number): Promise<PayrollDto> => {
    const response = await axiosClient.get<PayrollDto>(
      `/payroll/my-payroll?month=${month}&year=${year}`
    );
    return response.data;
  },

  // Manager: Tạo Thưởng/Phạt thủ công
  createAdjustment: async (
    data: PayrollAdjustmentRequest
  ): Promise<PayrollAdjustmentDto> => {
    const response = await axiosClient.post<PayrollAdjustmentDto>(
      "/payroll/adjustments",
      data
    );
    return response.data;
  },
};
