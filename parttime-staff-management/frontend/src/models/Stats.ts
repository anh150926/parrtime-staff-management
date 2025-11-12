/*
 * file: frontend/src/models/Stats.ts
 *
 * Models cho Module 4.
 */

// Dùng cho 1 dòng trong bảng Thống kê
export interface BestEmployeeResponse {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  phoneNumber: string;
  totalActualHours: number;
  totalPay: number;
  totalLateAndEarlyMinutes: number;
  totalPenalty: number;
}
