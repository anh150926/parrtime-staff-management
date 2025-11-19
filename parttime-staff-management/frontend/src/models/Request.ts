/* file: frontend/src/models/Request.ts */

export interface LeaveRequestDto {
  id?: number;
  userId?: number;
  staffName?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  reason: string;
  status?: string;
  managerResponse?: string;
}

export interface StaffAvailabilityDto {
  id?: number;
  startTime: string; // ISO DateTime
  endTime: string;
  reason: string;
}
