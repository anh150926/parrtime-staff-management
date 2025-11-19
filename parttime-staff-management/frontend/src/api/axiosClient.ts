import axios from "axios";
import { useAuthStore } from "../store/authStore";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api", // URL của Backend Spring Boot
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Tự động thêm Token vào header Authorization
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ Zustand store
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Xử lý lỗi chung (ví dụ: Token hết hạn -> Tự động Logout)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token không hợp lệ hoặc hết hạn -> Xóa store và chuyển về login
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
