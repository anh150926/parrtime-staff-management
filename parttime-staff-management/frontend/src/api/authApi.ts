/*
 * file: frontend/src/api/authApi.ts
 *
 * File service cho API xác thực.
 */

import axiosClient from "./axiosClient";
import { AuthRequest, AuthResponse, RegisterRequest } from "../models/Auth";

export const authApi = {
  login: (data: AuthRequest): Promise<AuthResponse> => {
    return axiosClient
      .post<AuthResponse>("/auth/login", data)
      .then((response) => response.data);
  },

  register: (data: RegisterRequest): Promise<AuthResponse> => {
    return axiosClient
      .post<AuthResponse>("/auth/register", data)
      .then((response) => response.data);
  },
};
