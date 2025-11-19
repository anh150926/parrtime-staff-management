/* file: frontend/src/models/User.ts */
import { EmployeeStatus } from "./Enums";

export interface ManagerAccountDto {
  userId: number;
  fullName: string;
  email: string;
  status: EmployeeStatus;
  branchId?: number;
  branchName?: string;
}

export interface ManagerCreationRequest {
  email: string;
  branchId: number;
  positionId: number;
  fullName: string;
  phoneNumber: string;
  baseSalary: number; // Lương cứng
  cccd?: string;
  dateOfBirth?: string; // YYYY-MM-DD
}
