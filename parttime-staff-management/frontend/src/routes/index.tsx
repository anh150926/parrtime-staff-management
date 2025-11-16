/*
 * file: frontend/src/routes/index.tsx
 *
 * (Phiên bản ĐẦY ĐỦ và CHÍNH XÁC, đã sửa lỗi lồng ghép)
 */

import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute"; // Import file bảo vệ
import { Role } from "../models/Enums";

// Layouts
import { MainLayout } from "../components/layout/MainLayout";

// Public Pages
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

// Protected Pages (Import tất cả các trang)
import { HomePage } from "../pages/HomePage";
import { RegisterNextWeekPage } from "../pages/RegisterNextWeekPage";
import { SchedulingPage } from "../pages/SchedulingPage";
import { WeeklyPayrollPage } from "../pages/WeeklyPayrollPage";
import { BestEmployeesPage } from "../pages/BestEmployeesPage";
import { CheckInOutPage } from "../pages/CheckInOutPage";

const router = createBrowserRouter([
  {
    // === Các Route Công khai (Public) ===
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    // === Các Route Yêu cầu Đăng nhập (Protected) ===
    // Bước 1: Yêu cầu đăng nhập
    path: "/",
    element: <ProtectedRoute />, // Kiểm tra login. Nếu OK, render <Outlet />
    children: [
      {
        // Bước 2: Hiển thị Khung sườn (Layout)
        element: <MainLayout />, // MainLayout được render vào <Outlet /> của ProtectedRoute
        // MainLayout CÓ <Outlet/> RIÊNG của nó
        children: [
          // Bước 3: Hiển thị Trang con (Page)
          // Các trang này được render vào <Outlet/> của MainLayout
          {
            path: "", // Trang chủ: / (Hồ sơ nhân viên)
            element: <HomePage />,
          },
          {
            path: "availability", // /availability (Module 1)
            element: <RegisterNextWeekPage />,
          },
          {
            path: "check-in", // /check-in (Chấm công)
            element: <CheckInOutPage />,
          },

          // === Các Route chỉ dành cho MANAGER (Lồng thêm 1 lớp bảo vệ) ===
          {
            element: <ProtectedRoute role={Role.MANAGER} />, // Bước 2.5: Kiểm tra Role
            children: [
              {
                path: "scheduling", // /scheduling
                element: <SchedulingPage />,
              },
              {
                path: "payroll", // /payroll
                element: <WeeklyPayrollPage />,
              },
              {
                path: "stats", // /stats
                element: <BestEmployeesPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

// Component AppRouter để dùng trong App.tsx
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
