/* file: frontend/src/components/layout/Navbar.tsx */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Role } from "../../models/Enums";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Link logo trỏ về dashboard tương ứng
  const homeLink =
    user?.role === Role.SUPER_ADMIN
      ? "/admin/dashboard"
      : user?.role === Role.MANAGER
      ? "/manager/dashboard"
      : "/staff/dashboard";

  return (
    <nav
      className="navbar navbar-expand navbar-dark bg-primary fixed-top px-3 shadow-sm"
      style={{ height: "60px", zIndex: 1030 }}
    >
      <Link
        className="navbar-brand fw-bold d-flex align-items-center"
        to={homeLink}
      >
        <i className="bi bi-cup-hot-fill me-2 fs-4"></i>
        PTSM Coffee
      </Link>

      <div className="collapse navbar-collapse justify-content-end">
        {user && (
          <div className="d-flex align-items-center text-white">
            <div className="me-3 text-end d-none d-md-block">
              <div className="fw-bold">{user.fullName}</div>
              <small className="text-white-50" style={{ fontSize: "0.75rem" }}>
                {user.role === Role.SUPER_ADMIN
                  ? "Chủ sở hữu"
                  : user.role === Role.MANAGER
                  ? "Quản lý"
                  : "Nhân viên"}
              </small>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline-light btn-sm"
            >
              <i className="bi bi-box-arrow-right me-1"></i> Thoát
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
