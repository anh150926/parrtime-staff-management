/* file: frontend/src/models/Dashboard.ts */
import { ScheduleAssignmentDto, ScheduleViewDto } from "./Schedule";

export interface StaffDashboardDto {
  upcomingShift?: ScheduleAssignmentDto;
  pendingLeaveRequests: number;
  pendingShiftMarketRequests: number;
  unreadAnnouncements: number;
}

export interface ManagerDashboardDto {
  pendingLeaveRequests: number;
  pendingRegistrations: number;
  pendingShiftMarket: number;
  pendingComplaints: number;

  totalStaff: number;
  totalHoursThisWeek: number;
  attendanceRate: number;

  todaySchedules: ScheduleViewDto[];
  unreadAnnouncements: number;
}

export interface BranchPerformanceDto {
  branchId: number;
  branchName: string;
  staffCount: number;
  payrollCost: number;
  workHours: number;
  attendanceRate: number;
}

export interface SuperAdminDashboardDto {
  totalBranches: number;
  totalManagers: number;
  totalStaff: number;
  totalPayrollCostThisMonth: number;
  totalHoursThisMonth: number;

  branchPerformance: BranchPerformanceDto[];
}
