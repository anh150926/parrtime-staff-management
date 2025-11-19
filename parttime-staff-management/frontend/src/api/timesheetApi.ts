import axiosClient from "./axiosClient";
import {
  CheckInRequest,
  TimesheetEditRequest,
  WorkLogDto,
} from "../models/Timesheet";

export const timesheetApi = {
  // Staff: Check-in
  checkIn: async (data: CheckInRequest): Promise<WorkLogDto> => {
    const response = await axiosClient.post<WorkLogDto>(
      "/timesheet/check-in",
      data
    );
    return response.data;
  },

  // Staff: Check-out
  checkOut: async (): Promise<WorkLogDto> => {
    const response = await axiosClient.post<WorkLogDto>("/timesheet/check-out");
    return response.data;
  },

  // Manager: Xem bảng công
  getBranchTimesheets: async (
    startDate: string,
    endDate: string
  ): Promise<WorkLogDto[]> => {
    const response = await axiosClient.get<WorkLogDto[]>(
      `/timesheet/branch?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  // Manager: Hiệu chỉnh công
  editTimesheet: async (
    id: number,
    data: TimesheetEditRequest
  ): Promise<WorkLogDto> => {
    const response = await axiosClient.put<WorkLogDto>(
      `/timesheet/edit/${id}`,
      data
    );
    return response.data;
  },
};
