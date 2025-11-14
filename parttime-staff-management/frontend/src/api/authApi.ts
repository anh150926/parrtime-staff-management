/*
 * file: frontend/src/api/authApi.ts
 *
 * File service cho API xác thực.
 */

import axiosClient from "./axiosClient";
// [SỬA LỖI]: Cú pháp đúng là "import type { ... }"
import type {
  AuthRequest,
  AuthResponse,
  RegisterRequest,
} from "../models/Auth";

export const authApi = {
  login: (data: AuthRequest): Promise<AuthResponse> => {
    return axiosClient
      .post<AuthResponse>("/auth/login", data)
      .then((response) => response.data); // <-- Dòng 18 của bạn
  },

  register: (data: RegisterRequest): Promise<AuthResponse> => {
    return axiosClient
      .post<AuthResponse>("/auth/register", data)
      .then((response) => response.data);
  },
};
