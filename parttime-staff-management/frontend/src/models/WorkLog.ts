/*
 * file: frontend/src/models/WorkLog.ts
 */
import { ShiftType } from "./Enums";

export interface CheckInRequest {
  employeeId: number;
  shiftDate: string; // "YYYY-MM-DD"
  shiftType: ShiftType;
}
export interface WorkLogResponse {
  workLogId: number;
  employeeId: number;
  employeeName: string;
  checkIn: string; // ISO DateTime
  checkOut: string | null;
  shiftDate: string; // "YYYY-MM-DD"
  shiftType: ShiftType;
  actualHours?: number;
  baseHours?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
}
