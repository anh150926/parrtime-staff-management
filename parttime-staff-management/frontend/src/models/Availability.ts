/*
 * file: frontend/src/models/Availability.ts
 *
 * Models cho Module 1.
 */
import { DayOfWeekEnum, ShiftType } from "./Enums";

// 1 "ô" check
export interface AvailabilitySlotDto {
  dayOfWeek: DayOfWeekEnum;
  shiftType: ShiftType;
}

// Gửi lên server
export interface AvailabilityRequest {
  employeeId: number;
  weekStartDate: string; // "YYYY-MM-DD"
  slots: AvailabilitySlotDto[];
}

// Nhận về từ server
export interface AvailabilityResponse {
  availabilityId?: number; // (Có thể là 'NEW')
  employeeId: number;
  weekStartDate: string; // "YYYY-MM-DD"
  status: string; // 'NEW', 'PENDING', 'SUBMITTED'
  slots: AvailabilitySlotDto[];
}
