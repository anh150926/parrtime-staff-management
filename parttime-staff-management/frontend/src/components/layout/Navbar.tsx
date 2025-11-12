/*
 * file: frontend/src/components/layout/Navbar.tsx
 *
 * Thanh menu phía trên (hiển thị tên user, nút logout).
 */

import React from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">Quản lý nhân viên</div>
      <div className="navbar-user">
        {user && <span>Xin chào, {user.name}</span>}
        <button onClick={handleLogout}>Đăng xuất</button>
      </div>
    </header>
  );
};
