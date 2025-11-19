/* file: frontend/src/models/Schedule.ts */

export interface ShiftTemplateDto {
  id?: number;
  name: string;
  startTime: string; // "07:00:00"
  endTime: string;
}

export interface ScheduleCreateRequest {
  shiftTemplateId: number;
  scheduleDate: string; // YYYY-MM-DD
  requiredStaff: number;
}

export interface AssignedStaffDto {
  userId: number;
  fullName: string;
  status: string; // PENDING, CONFIRMED
}

export interface ScheduleViewDto {
  scheduleId: number;
  shiftName: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  requiredStaff: number;
  assignedStaffCount: number;
  assignedStaff: AssignedStaffDto[];
}

export interface ScheduleAssignmentDto {
  assignmentId: number;
  status: string;
  userId: number;
  staffName: string;
  scheduleId: number;
  shiftName: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
}

export interface ShiftMarketDto {
  marketId: number;
  assignmentId: number;
  shiftName: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  offeringUserId: number;
  offeringUserName: string;
  claimingUserId?: number;
  claimingUserName?: string;
  status: string; // POSTED, CLAIMED, APPROVED
}
