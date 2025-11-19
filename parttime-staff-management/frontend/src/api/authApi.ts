import axiosClient from "./axiosClient";
import { AuthRequest, AuthResponse } from "../models/Auth";

export const authApi = {
  login: async (data: AuthRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  },
};
