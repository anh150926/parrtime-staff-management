/*
 * file: frontend/src/components/layout/MainLayout.tsx
 *
 * Component "gói" lại (wrapper) cho các trang cần đăng nhập.
 */

import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const MainLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
