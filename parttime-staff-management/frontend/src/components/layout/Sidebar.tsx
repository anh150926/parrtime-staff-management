/*
 * file: frontend/src/components/layout/Sidebar.tsx
 *
 * Thanh điều hướng bên trái (menu chính).
 */

import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Role } from "../../models/Enums";

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const isManager = user?.role === Role.MANAGER;

  return (
    <nav className="sidebar">
      <ul>
        <li>
          <NavLink to="/">Trang chủ</NavLink>
        </li>
        <li>
          <NavLink to="/availability">Đăng ký lịch</NavLink>
        </li>

        {/* Chỉ Manager mới thấy các link này */}
        {isManager && (
          <>
            <li>
              <NavLink to="/scheduling">Xếp lịch</NavLink>
            </li>
            <li>
              <NavLink to="/payroll">Tính lương</NavLink>
            </li>
            <li>
              <NavLink to="/stats">Thống kê</NavLink>
            </li>
          </>
        )}

        <li>
          <NavLink to="/check-in">Chấm công</NavLink>
        </li>
      </ul>
    </nav>
  );
};
