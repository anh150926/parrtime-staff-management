import axiosClient from "./axiosClient";
import {
  ManagerDashboardDto,
  StaffDashboardDto,
  SuperAdminDashboardDto,
} from "../models/Dashboard";

export const dashboardApi = {
  getStaffDashboard: async (): Promise<StaffDashboardDto> => {
    const response = await axiosClient.get<StaffDashboardDto>(
      "/dashboard/staff"
    );
    return response.data;
  },
  getManagerDashboard: async (): Promise<ManagerDashboardDto> => {
    const response = await axiosClient.get<ManagerDashboardDto>(
      "/dashboard/manager"
    );
    return response.data;
  },
  getSuperAdminDashboard: async (): Promise<SuperAdminDashboardDto> => {
    const response = await axiosClient.get<SuperAdminDashboardDto>(
      "/dashboard/super-admin"
    );
    return response.data;
  },
};
