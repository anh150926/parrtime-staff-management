/*
 * file: frontend/src/models/Schedule.ts
 */
import { DayOfWeekEnum, ScheduleStatus, ShiftType } from "./Enums";

export interface AssignedEmployeeDto {
  employeeId: number;
  name: string;
}
export interface ScheduleViewResponse {
  scheduleId: number;
  restaurantId: number;
  weekStartDate: string; // "YYYY-MM-DD"
  status: ScheduleStatus;
  shiftAssignments: Record<string, AssignedEmployeeDto[]>;
}
export interface RegisteredEmployeeDto {
  employeeId: number;
  name: string;
  phoneNumber: string;
  totalShiftsScheduled: number;
}
export interface AssignShiftRequest {
  restaurantId: number;
  weekStartDate: string; // "YYYY-MM-DD"
  dayOfWeek: DayOfWeekEnum;
  shiftType: ShiftType;
  selectedEmployeeIds: number[];
}
