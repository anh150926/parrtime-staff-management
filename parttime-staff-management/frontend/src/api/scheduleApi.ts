import axiosClient from "./axiosClient";
import {
  ScheduleCreateRequest,
  ScheduleViewDto,
  ShiftTemplateDto,
} from "../models/Schedule";

export const scheduleApi = {
  // --- Mẫu Ca ---
  createTemplate: async (data: ShiftTemplateDto): Promise<ShiftTemplateDto> => {
    const response = await axiosClient.post<ShiftTemplateDto>(
      "/schedule/templates",
      data
    );
    return response.data;
  },
  getTemplates: async (): Promise<ShiftTemplateDto[]> => {
    const response = await axiosClient.get<ShiftTemplateDto[]>(
      "/schedule/templates"
    );
    return response.data;
  },
  deleteTemplate: async (id: number): Promise<void> => {
    await axiosClient.delete(`/schedule/templates/${id}`);
  },

  // --- Lịch làm việc ---
  createSchedule: async (
    data: ScheduleCreateRequest
  ): Promise<ScheduleViewDto> => {
    const response = await axiosClient.post<ScheduleViewDto>("/schedule", data);
    return response.data;
  },

  // Xem lịch tuần (date format: YYYY-MM-DD)
  getScheduleForWeek: async (
    weekStartDate: string
  ): Promise<ScheduleViewDto[]> => {
    const response = await axiosClient.get<ScheduleViewDto[]>(
      `/schedule/week?weekStartDate=${weekStartDate}`
    );
    return response.data;
  },

  // Manager tự gán nhân viên (Xếp lịch thủ công)
  assignStaff: async (scheduleId: number, staffId: number): Promise<void> => {
    await axiosClient.post(`/schedule/assign/${scheduleId}/staff/${staffId}`);
  },
};
