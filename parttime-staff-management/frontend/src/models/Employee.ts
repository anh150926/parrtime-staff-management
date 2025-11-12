/*
 * file: frontend/src/models/Employee.ts
 *
 * Model cho Employee.
 */

import { Role } from "./Enums";

export interface Employee {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE";
  restaurantId: number;
  restaurantName?: string; // (Tùy chọn)
}

// Dùng cho API /api/employees/search
export interface EmployeeSearchResponse {
  id: number;
  name: string;
  phoneNumber: string;
  restaurantName: string;
}
