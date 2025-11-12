/*
 * file: frontend/src/models/Payroll.ts
 */
import { ShiftType } from "./Enums";

export interface PayrollSummaryResponse {
  payrollId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  phoneNumber: string;
  totalBaseHours: number;
  totalOvertimeHours: number;
  totalLateAndEarlyMinutes: number;
  basePay: number;
  overtimePay: number;
  totalPenalty: number;
  finalPay: number;
}
export interface PayrollDetailResponse {
  dayOfWeek: string;
  shiftDate: string; // "YYYY-MM-DD"
  shift: ShiftType;
  checkIn: string; // ISO DateTime String
  checkOut: string; // ISO DateTime String
  baseHours: number;
  overtimeHours: number;
  lateAndEarlyMinutes: number;
  basePay: number;
  overtimePay: number;
  penaltyAmount: number;
  totalPayForShift: number;
}
