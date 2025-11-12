/*
 * file: frontend/src/api/schedulingApi.ts
 *
 * File service cho API Module 2 (Xếp lịch).
 */

import axiosClient from "./axiosClient";
import { DayOfWeekEnum, ShiftType } from "../models/Enums";
import {
  ScheduleViewResponse,
  RegisteredEmployeeDto,
  AssignShiftRequest,
} from "../models/Schedule";

export const schedulingApi = {
  getWeekSchedule: (
    restaurantId: number,
    weekStartDate: string
  ): Promise<ScheduleViewResponse> => {
    return axiosClient
      .get<ScheduleViewResponse>("/scheduling/week-view", {
        params: { restaurantId, weekStartDate },
      })
      .then((response) => response.data);
  },

  getRegisteredEmployees: (
    restaurantId: number,
    weekStartDate: string,
    dayOfWeek: DayOfWeekEnum,
    shiftType: ShiftType
  ): Promise<RegisteredEmployeeDto[]> => {
    return axiosClient
      .get<RegisteredEmployeeDto[]>("/scheduling/registered-employees", {
        params: { restaurantId, weekStartDate, dayOfWeek, shiftType },
      })
      .then((response) => response.data);
  },

  assignEmployeesToShift: (
    data: AssignShiftRequest
  ): Promise<ScheduleViewResponse> => {
    return axiosClient
      .post<ScheduleViewResponse>("/scheduling/assign-shift", data)
      .then((response) => response.data);
  },
};
