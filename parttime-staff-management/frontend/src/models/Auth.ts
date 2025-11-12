/*
 * file: frontend/src/models/Auth.ts
 *
 * Models cho Đăng nhập / Đăng ký.
 * Ánh xạ 1-1 với dto/auth/
 */

import { Role } from "./Enums";

// Dùng cho API /api/auth/login
export interface AuthRequest {
  email: string;
  password: string;
}

// Dùng cho API /api/auth/register
export interface RegisterRequest extends AuthRequest {
  name: string;
  phoneNumber: string;
  restaurantId: number;
}

// Dữ liệu trả về khi login/register thành công
export interface AuthResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: Role;
  restaurantId: number;
}

// Dữ liệu User được lưu trong store
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  restaurantId: number;
}
