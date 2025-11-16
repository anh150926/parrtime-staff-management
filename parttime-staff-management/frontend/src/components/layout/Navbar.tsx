/*
 * file: frontend/src/components/layout/Navbar.tsx
 *
 * (Code đã sửa)
 * Thanh menu phía trên (hiển thị tên user, nút logout).
 */

import React from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom"; // Import Link

export const Navbar: React.FC = () => {
  // Lấy "user" và "logout" từ store
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Xóa token khỏi state và localStorage
    navigate("/login"); // Chuyển hướng về trang đăng nhập
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">Quản lý nhân viên</div>
      <div className="navbar-user">
        {user && (
          <>
            {/* Link đến Hồ sơ (Trang chủ) */}
            <Link to="/">Xin chào, {user.name}</Link>

            {/* Nút Đăng xuất */}
            <button onClick={handleLogout} className="btn-danger">
              Đăng xuất
            </button>
          </>
        )}
      </div>
    </header>
  );
};
