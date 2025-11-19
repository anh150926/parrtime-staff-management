import axiosClient from "./axiosClient";
import {
  StaffCreationRequest,
  StaffProfileDto,
  StaffProfileUpdateRequest,
} from "../models/Staff";

export const staffApi = {
  // (Manager) Thêm nhân viên mới
  createStaff: async (data: StaffCreationRequest): Promise<StaffProfileDto> => {
    const response = await axiosClient.post<StaffProfileDto>("/staff", data);
    return response.data;
  },

  // (Manager) Lấy danh sách nhân viên của cơ sở
  getStaffForBranch: async (): Promise<StaffProfileDto[]> => {
    const response = await axiosClient.get<StaffProfileDto[]>("/staff");
    return response.data;
  },

  // (Manager/Staff) Xem hồ sơ chi tiết
  getProfile: async (userId: number): Promise<StaffProfileDto> => {
    const response = await axiosClient.get<StaffProfileDto>(
      `/staff/profile/${userId}`
    );
    return response.data;
  },

  // (Staff) Tự cập nhật hồ sơ
  updateMyProfile: async (
    data: StaffProfileUpdateRequest
  ): Promise<StaffProfileDto> => {
    const response = await axiosClient.put<StaffProfileDto>(
      "/staff/my-profile",
      data
    );
    return response.data;
  },
};
