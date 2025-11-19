/* file: frontend/src/components/layout/Sidebar.tsx */
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Role } from "../../models/Enums";

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  if (!user) return null;

  // Hàm tạo class cho link (Active sẽ có màu xanh)
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `list-group-item list-group-item-action border-0 py-3 d-flex align-items-center ${
      isActive
        ? "active bg-primary-subtle text-primary fw-bold border-start border-4 border-primary"
        : "text-dark"
    }`;

  return (
    <div
      className="bg-white border-end h-100 shadow-sm d-flex flex-column"
      style={{
        width: "260px",
        position: "fixed",
        top: "60px",
        bottom: 0,
        overflowY: "auto",
        zIndex: 1020,
      }}
    >
      <div className="list-group list-group-flush mt-2">
        {/* === SUPER ADMIN === */}
        {user.role === Role.SUPER_ADMIN && (
          <>
            <div className="px-3 py-2 text-muted small fw-bold text-uppercase">
              Hệ thống
            </div>
            <NavLink to="/admin/dashboard" className={linkClass}>
              <i className="bi bi-speedometer2 me-3"></i>Tổng quan
            </NavLink>
            <NavLink to="/admin/branches" className={linkClass}>
              <i className="bi bi-shop me-3"></i>Cơ sở
            </NavLink>
            <NavLink to="/admin/managers" className={linkClass}>
              <i className="bi bi-people-fill me-3"></i>Quản lý
            </NavLink>
          </>
        )}

        {/* === MANAGER === */}
        {user.role === Role.MANAGER && (
          <>
            <div className="px-3 py-2 text-muted small fw-bold text-uppercase mt-2">
              Quản lý
            </div>
            <NavLink to="/manager/dashboard" className={linkClass}>
              <i className="bi bi-grid-1x2-fill me-3"></i>Dashboard
            </NavLink>
            <NavLink to="/manager/staff" className={linkClass}>
              <i className="bi bi-person-vcard me-3"></i>Nhân viên
            </NavLink>
            <NavLink to="/manager/payroll" className={linkClass}>
              <i className="bi bi-cash-coin me-3"></i>Lương thưởng
            </NavLink>

            <div className="px-3 py-2 text-muted small fw-bold text-uppercase mt-3">
              Vận hành
            </div>
            <NavLink to="/manager/schedule" className={linkClass}>
              <i className="bi bi-calendar-week me-3"></i>Xếp lịch
            </NavLink>
            <NavLink to="/manager/requests" className={linkClass}>
              <i className="bi bi-inbox-fill me-3"></i>Duyệt đơn
            </NavLink>
            <NavLink to="/manager/timesheet" className={linkClass}>
              <i className="bi bi-clock-history me-3"></i>Chấm công
            </NavLink>
            <NavLink to="/manager/operations" className={linkClass}>
              <i className="bi bi-list-check me-3"></i>Sổ tay & Task
            </NavLink>

            <div className="px-3 py-2 text-muted small fw-bold text-uppercase mt-3">
              Khác
            </div>
            <NavLink to="/manager/communication" className={linkClass}>
              <i className="bi bi-chat-left-text me-3"></i>Giao tiếp
            </NavLink>
            <NavLink to="/manager/audit" className={linkClass}>
              <i className="bi bi-activity me-3"></i>Lịch sử
            </NavLink>
          </>
        )}

        {/* === STAFF === */}
        {user.role === Role.STAFF && (
          <>
            <div className="px-3 py-2 text-muted small fw-bold text-uppercase mt-2">
              Cá nhân
            </div>
            <NavLink to="/staff/dashboard" className={linkClass}>
              <i className="bi bi-house-door-fill me-3"></i>Trang chủ
            </NavLink>
            <NavLink to="/staff/profile" className={linkClass}>
              <i className="bi bi-person-circle me-3"></i>Hồ sơ
            </NavLink>

            <div className="px-3 py-2 text-muted small fw-bold text-uppercase mt-3">
              Công việc
            </div>
            <NavLink to="/staff/schedule" className={linkClass}>
              <i className="bi bi-calendar-check me-3"></i>Lịch & Chợ ca
            </NavLink>
            <NavLink to="/staff/tasks" className={linkClass}>
              <i className="bi bi-check2-square me-3"></i>Checklist
            </NavLink>
            <NavLink to="/staff/check-in" className={linkClass}>
              <i className="bi bi-qr-code me-3"></i>Chấm công
            </NavLink>
            <NavLink to="/staff/payroll" className={linkClass}>
              <i className="bi bi-wallet2 me-3"></i>Phiếu lương
            </NavLink>
            <NavLink to="/staff/feedback" className={linkClass}>
              <i className="bi bi-envelope-paper me-3"></i>Khiếu nại
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};
