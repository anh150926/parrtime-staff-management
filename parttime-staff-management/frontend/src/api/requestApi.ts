import axiosClient from "./axiosClient";
import { ApprovalDto } from "../models/Common";
import { LeaveRequestDto, StaffAvailabilityDto } from "../models/Request";
// [SỬA LỖI]: Import ScheduleAssignmentDto và ShiftMarketDto từ Schedule.ts (không phải Request.ts)
import { ScheduleAssignmentDto, ShiftMarketDto } from "../models/Schedule";

export const requestApi = {
  // --- Đơn Xin Nghỉ ---
  createLeave: async (data: LeaveRequestDto): Promise<LeaveRequestDto> => {
    const response = await axiosClient.post<LeaveRequestDto>(
      "/requests/leave",
      data
    );
    return response.data;
  },
  getPendingLeaves: async (): Promise<LeaveRequestDto[]> => {
    const response = await axiosClient.get<LeaveRequestDto[]>(
      "/requests/leave/pending"
    );
    return response.data;
  },
  approveLeave: async (
    id: number,
    data: ApprovalDto
  ): Promise<LeaveRequestDto> => {
    const response = await axiosClient.put<LeaveRequestDto>(
      `/requests/leave/${id}/approval`,
      data
    );
    return response.data;
  },

  // --- Đăng Ký Ca ---
  registerShift: async (scheduleId: number): Promise<ScheduleAssignmentDto> => {
    const response = await axiosClient.post<ScheduleAssignmentDto>(
      `/requests/registration/${scheduleId}`
    );
    return response.data;
  },
  getPendingRegistrations: async (): Promise<ScheduleAssignmentDto[]> => {
    const response = await axiosClient.get<ScheduleAssignmentDto[]>(
      "/requests/registration/pending"
    );
    return response.data;
  },
  approveRegistration: async (
    id: number,
    data: ApprovalDto
  ): Promise<ScheduleAssignmentDto> => {
    const response = await axiosClient.put<ScheduleAssignmentDto>(
      `/requests/registration/${id}/approval`,
      data
    );
    return response.data;
  },

  // --- Chợ Ca (Shift Market) ---
  postShiftToMarket: async (assignmentId: number): Promise<ShiftMarketDto> => {
    const response = await axiosClient.post<ShiftMarketDto>(
      `/requests/market/post/${assignmentId}`
    );
    return response.data;
  },
  getAvailableMarketShifts: async (): Promise<ShiftMarketDto[]> => {
    const response = await axiosClient.get<ShiftMarketDto[]>(
      "/requests/market/available"
    );
    return response.data;
  },
  claimShift: async (marketId: number): Promise<ShiftMarketDto> => {
    const response = await axiosClient.put<ShiftMarketDto>(
      `/requests/market/claim/${marketId}`
    );
    return response.data;
  },
  getPendingMarket: async (): Promise<ShiftMarketDto[]> => {
    const response = await axiosClient.get<ShiftMarketDto[]>(
      "/requests/market/pending"
    );
    return response.data;
  },
  approveMarket: async (
    id: number,
    data: ApprovalDto
  ): Promise<ShiftMarketDto> => {
    const response = await axiosClient.put<ShiftMarketDto>(
      `/requests/market/${id}/approval`,
      data
    );
    return response.data;
  },

  // --- Báo Bận (Unavailability) ---
  createUnavailability: async (
    data: StaffAvailabilityDto
  ): Promise<StaffAvailabilityDto> => {
    const response = await axiosClient.post<StaffAvailabilityDto>(
      "/requests/unavailability",
      data
    );
    return response.data;
  },
  getMyUnavailability: async (): Promise<StaffAvailabilityDto[]> => {
    const response = await axiosClient.get<StaffAvailabilityDto[]>(
      "/requests/my-unavailability"
    );
    return response.data;
  },
  deleteUnavailability: async (id: number): Promise<void> => {
    await axiosClient.delete(`/requests/unavailability/${id}`);
  },
};
