/* file: frontend/src/routes/ProtectedRoute.tsx */
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // Nếu chưa đăng nhập -> Đá về trang Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập -> Cho phép đi tiếp (render Outlet)
  return <Outlet />;
};
