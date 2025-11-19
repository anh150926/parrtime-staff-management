/* file: frontend/src/models/Staff.ts */
import { EmployeeStatus, Role } from "./Enums";

export interface StaffProfileDto {
  userId: number;
  email: string;
  role: Role;
  status: EmployeeStatus;

  branchId?: number;
  branchName?: string;
  positionId?: number;
  positionName?: string;

  employeeCode?: string;
  fullName: string;
  phoneNumber: string;
  baseSalary?: number;
  cccd?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  address?: string;
  education?: string;
}

export interface StaffCreationRequest {
  email: string;
  positionId: number;
  fullName: string;
  phoneNumber: string;
  cccd?: string;
  dateOfBirth?: string;
  address?: string;
  education?: string;
}

export interface StaffProfileUpdateRequest {
  phoneNumber: string;
  email: string;
  address?: string;
  newPassword?: string;
}
