/* file: frontend/src/models/Auth.ts */
import { Role } from "./Enums";

export interface AuthRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  role: Role;
  fullName: string;
  branchId?: number;
}
