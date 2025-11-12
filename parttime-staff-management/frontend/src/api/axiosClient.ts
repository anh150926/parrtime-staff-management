/*
 * file: frontend/src/api/axiosClient.ts
 *
 * Cấu hình Axios instance trung tâm.
 */

import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Địa chỉ API backend của bạn
const API_BASE_URL = "http://localhost:8080/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Tự động đính kèm token vào mọi request
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Tự động logout nếu gặp lỗi 401 (Token hết hạn)
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
