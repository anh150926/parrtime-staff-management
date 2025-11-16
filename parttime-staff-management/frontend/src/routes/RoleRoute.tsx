/*
 * file: frontend/src/routes/RoleRoute.tsx
 *
 * (File mới)
 * Component này kiểm tra "Vai trò" (role) của người dùng.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Role } from "../models/Enums";

interface RoleRouteProps {
  children: React.ReactElement;
  role: Role; // Vai trò bắt buộc để truy cập
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, role }) => {
  const { user } = useAuthStore();

  // Nếu vai trò của user không khớp với vai trò yêu cầu
  if (!user || user.role !== role) {
    // Chuyển hướng về trang chủ
    return <Navigate to="/" replace />;
  }

  // Nếu vai trò khớp, hiển thị trang con (ví dụ: <SchedulingPage />)
  return children;
};
