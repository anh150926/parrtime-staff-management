/*
 * file: frontend/src/store/authStore.ts
 *
 * Quản lý trạng thái đăng nhập (User, Token, Role) toàn cục.
 * Sử dụng Zustand + Persist (Tự động lưu vào LocalStorage của trình duyệt).
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthResponse } from "../models/Auth";
import { Role } from "../models/Enums";

// Định nghĩa kiểu dữ liệu cho Store
interface AuthState {
  // --- State (Dữ liệu) ---
  token: string | null; // JWT Token dùng để gọi API
  user: AuthResponse | null; // Thông tin user (id, email, role, fullName...)
  isAuthenticated: boolean; // Cờ kiểm tra: Đã đăng nhập chưa?

  // --- Actions (Hành động) ---
  login: (data: AuthResponse) => void; // Hàm gọi khi đăng nhập thành công
  logout: () => void; // Hàm gọi khi đăng xuất

  // Hàm tiện ích để kiểm tra quyền (dùng trong các Component)
  hasRole: (role: Role) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 1. Giá trị khởi tạo (Mặc định là chưa đăng nhập)
      token: null,
      user: null,
      isAuthenticated: false,

      // 2. Hành động Login: Lưu thông tin vào Store
      login: (data: AuthResponse) => {
        set({
          token: data.token,
          user: data,
          isAuthenticated: true,
        });
      },

      // 3. Hành động Logout: Xóa sạch thông tin
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
        // Xóa sạch localStorage để đảm bảo an toàn tuyệt đối
        localStorage.removeItem("auth-storage");
      },

      // 4. Hàm kiểm tra Role (dùng cho ProtectedRoute và ẩn/hiện nút bấm)
      hasRole: (role: Role) => {
        const currentUser = get().user;
        return currentUser?.role === role;
      },
    }),
    {
      name: "auth-storage", // Tên key sẽ lưu trong LocalStorage (F12 -> Application -> Local Storage để xem)
      storage: createJSONStorage(() => localStorage), // Cấu hình lưu trữ
    }
  )
);
