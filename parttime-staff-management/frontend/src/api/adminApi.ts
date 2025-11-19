import axiosClient from "./axiosClient";
import { BranchDto } from "../models/Branch";
import { ManagerAccountDto, ManagerCreationRequest } from "../models/User";

export const adminApi = {
  // --- Quản lý Cơ sở ---
  getAllBranches: async (): Promise<BranchDto[]> => {
    const response = await axiosClient.get<BranchDto[]>("/admin/branches");
    return response.data;
  },
  createBranch: async (data: BranchDto): Promise<BranchDto> => {
    const response = await axiosClient.post<BranchDto>("/admin/branches", data);
    return response.data;
  },

  // --- Quản lý Tài khoản Manager ---
  getManagers: async (): Promise<ManagerAccountDto[]> => {
    const response = await axiosClient.get<ManagerAccountDto[]>(
      "/admin/managers"
    );
    return response.data;
  },
  createManager: async (
    data: ManagerCreationRequest
  ): Promise<ManagerAccountDto> => {
    const response = await axiosClient.post<ManagerAccountDto>(
      "/admin/managers",
      data
    );
    return response.data;
  },
};
