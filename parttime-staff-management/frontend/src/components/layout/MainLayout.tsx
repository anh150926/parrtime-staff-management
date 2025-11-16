/*
 * file: frontend/src/components/layout/MainLayout.tsx
 *
 * (Code đã sửa)
 * Component "gói" lại (wrapper) cho các trang cần đăng nhập.
 */

import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const MainLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <Navbar /> {/* Thanh menu trên (có nút Đăng xuất) */}
      <div className="app-content">
        <Sidebar /> {/* Menu chức năng bên trái */}
        <main className="main-content">
          {/* <Outlet /> là nơi các trang con (HomePage, SchedulingPage...)
              sẽ được render (hiển thị)
          */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
