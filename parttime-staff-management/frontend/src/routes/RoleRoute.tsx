/* file: frontend/src/routes/RoleRoute.tsx */
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Role } from "../models/Enums";

interface Props {
  requiredRole: Role; // Vai trò bắt buộc để vào route này
}

export const RoleRoute: React.FC<Props> = ({ requiredRole }) => {
  const { user } = useAuthStore();

  // Nếu không có user (lỗi lạ) hoặc Role không khớp -> Đá về trang 403 (Access Denied)
  // (Lưu ý: Bạn cần tạo trang AccessDeniedPage trong shared/)
  if (!user || user.role !== requiredRole) {
    return <Navigate to="/access-denied" replace />;
  }

  // Nếu đúng Role -> Cho phép hiển thị trang
  return <Outlet />;
};
