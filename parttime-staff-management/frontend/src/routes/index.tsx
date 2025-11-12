/*
 * file: frontend/src/routes/index.tsx
 * (Code đã sửa)
 */

import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
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
import { CheckInOutPage } from "../pages/CheckInOutPage"; // File bạn vừa tạo

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
    // Tất cả các route con của route này SẼ DÙNG MainLayout
    path: "/",
    element: (
      <ProtectedRoute>
        {" "}
        {/* Bước 1: Yêu cầu đăng nhập */}
        <MainLayout />{" "}
        {/* Nếu đã đăng nhập, hiển thị Layout (Sidebar/Navbar) */}
      </ProtectedRoute>
    ),
    // MainLayout sẽ có <Outlet/>, nơi các children này được render
    children: [
      {
        path: "", // Trang chủ: /
        element: <HomePage />,
      },
      {
        path: "availability", // /availability
        element: <RegisterNextWeekPage />,
      },
      {
        path: "check-in", // /check-in
        element: <CheckInOutPage />,
      },

      // === Các Route chỉ dành cho MANAGER ===
      // Chúng ta tạo 1 route cha để kiểm tra Role MANAGER
      {
        element: <ProtectedRoute role={Role.MANAGER} />, // Bước 2: Yêu cầu Role MANAGER
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
]);

// Component AppRouter để dùng trong App.tsx
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
