/*
 * file: frontend/src/routes/ProtectedRoute.tsx
 *
 * (Code đã sửa lỗi logic)
 * Component này kiểm tra "Đã đăng nhập hay chưa" VÀ "Vai trò (Role)".
 */

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Role } from "../models/Enums"; // Đảm bảo import Role

interface ProtectedRouteProps {
  role?: Role; // (Tùy chọn) Bảo vệ theo role
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { isAuthenticated, user } = useAuthStore();

  // 1. Kiểm tra đã đăng nhập chưa?
  if (!isAuthenticated) {
    // Nếu chưa, chuyển hướng về trang login
    return <Navigate to="/login" replace />;
  }

  // 2. (Tùy chọn) Kiểm tra có đúng quyền (role) không?
  if (role && user?.role !== role) {
    // Nếu là NV cố vào trang Manager -> đá về trang chủ
    return <Navigate to="/" replace />;
  }

  // 3. Nếu OK, render <Outlet /> (để các route con lồng nhau hiển thị)
  return <Outlet />;
};
