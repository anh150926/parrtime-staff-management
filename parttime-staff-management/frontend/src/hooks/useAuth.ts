/*
 * file: frontend/src/hooks/useAuth.ts
 */
import { useAuthStore } from "../store/authStore";
import { Role } from "../models/Enums";

export const useAuth = () => {
  // Lấy state và actions từ Store
  const { user, token, login, logout, hasRole } = useAuthStore();

  return {
    // Dữ liệu
    user,
    token,
    isAuthenticated: !!token && !!user, // Convert sang boolean

    // Actions
    login,
    logout,

    // Helpers (Cờ kiểm tra vai trò nhanh - Dùng để ẩn hiện nút bấm trên giao diện)
    isSuperAdmin: user?.role === Role.SUPER_ADMIN,
    isManager: user?.role === Role.MANAGER,
    isStaff: user?.role === Role.STAFF,

    // Hàm kiểm tra vai trò tùy ý
    checkRole: hasRole,
  };
};
