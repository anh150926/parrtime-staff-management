/* file: frontend/src/models/Timesheet.ts */

export interface WorkLogDto {
  id: number;
  userId: number;
  staffName: string;
  checkIn: string; // ISO DateTime
  checkOut?: string;
  actualHours?: number;
  lateMinutes?: number;

  isEdited: boolean;
  editReason?: string;
  editedByManagerName?: string;
}

export interface CheckInRequest {
  assignmentId: number;
}

export interface TimesheetEditRequest {
  newCheckIn: string;
  newCheckOut: string;
  reason: string;
}
