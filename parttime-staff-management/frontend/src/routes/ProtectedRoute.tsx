/*
 * file: frontend/src/routes/ProtectedRoute.tsx
 * (Sửa lại)
 */

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Role } from "../models/Enums";

interface ProtectedRouteProps {
  role?: Role;
  children?: React.ReactNode; // <-- [THÊM DÒNG NÀY]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { isAuthenticated, user } = useAuthStore();

  // 1. Kiểm tra đã đăng nhập chưa?
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Kiểm tra có đúng quyền (role) không?
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  // 3. Nếu OK, render Outlet (cho các route con)
  // (Chúng ta không dùng prop 'children'
  // nhưng TypeScript cần nó để hợp lệ hóa cấu trúc)
  return <Outlet />;
};
