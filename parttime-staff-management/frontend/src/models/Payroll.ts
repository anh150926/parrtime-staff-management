/* file: frontend/src/models/Payroll.ts */
import { AdjustmentType } from "./Enums";

export interface PayrollAdjustmentDto {
  id: number;
  type: AdjustmentType; // BONUS, PENALTY
  amount: number;
  reason: string;
  createdAt: string;
  managerName: string;
}

export interface PayrollAdjustmentRequest {
  userId: number;
  type: AdjustmentType;
  amount: number;
  reason: string;
}

export interface PayrollCalculationRequest {
  month: number;
  year: number;
}

export interface PayrollDto {
  id: number;
  userId: number;
  staffName: string;
  employeeCode: string;
  month: number;
  year: number;
  status: string; // PENDING, CALCULATED, PAID

  totalWorkHours: number;
  totalLateMinutes: number;

  basePay: number;
  totalBonus: number;
  totalPenalty: number;
  finalPay: number;

  adjustments: PayrollAdjustmentDto[];
}
