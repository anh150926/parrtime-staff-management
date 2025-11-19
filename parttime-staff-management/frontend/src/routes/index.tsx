/* file: frontend/src/routes/index.tsx */
import React from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { Role } from "../models/Enums";
import { MainLayout } from "../components/layout/MainLayout";
import { useAuthStore } from "../store/authStore";

// --- IMPORT CÁC TRANG (PAGES) ---

// Public & Shared
import { LoginPage } from "../pages/public/LoginPage";
import { NotFoundPage } from "../pages/shared/NotFoundPage";
import { AccessDeniedPage } from "../pages/shared/AccessDeniedPage";

// Admin Pages
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { BranchManagementPage } from "../pages/admin/BranchManagementPage";
import { ManagerAccountsPage } from "../pages/admin/ManagerAccountsPage";

// Manager Pages
import { ManagerDashboard } from "../pages/manager/ManagerDashboard";
import { StaffListPage } from "../pages/manager/StaffListPage";
import { StaffProfilePage } from "../pages/manager/StaffProfilePage";
import { SchedulePage } from "../pages/manager/SchedulePage";
import { RequestsPage } from "../pages/manager/RequestsPage";
import { TimesheetPage } from "../pages/manager/TimesheetPage";
import { PayrollPage } from "../pages/manager/PayrollPage";
import { OperationsPage } from "../pages/manager/OperationsPage";
import { CommunicationPage } from "../pages/manager/CommunicationPage";
import { AuditLogPage } from "../pages/manager/AuditLogPage";

// Staff Pages
import { StaffDashboard } from "../pages/staff/StaffDashboard";
import { MySchedulePage } from "../pages/staff/MySchedulePage";
import { MyTasksPage } from "../pages/staff/MyTasksPage";
import { MyPayrollPage } from "../pages/staff/MyPayrollPage";
import { MyProfilePage } from "../pages/staff/MyProfilePage";
import { FeedbackPage } from "../pages/staff/FeedbackPage";
import { CheckInOutPage } from "../pages/staff/CheckInOutPage";

// --- COMPONENT ĐIỀU HƯỚNG THÔNG MINH ---
// (Khi vào trang chủ "/", tự động chuyển hướng đến Dashboard đúng theo vai trò)
const RedirectToRoleDashboard = () => {
  const { user } = useAuthStore();
  if (user?.role === Role.SUPER_ADMIN)
    return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === Role.MANAGER)
    return <Navigate to="/manager/dashboard" replace />;
  if (user?.role === Role.STAFF)
    return <Navigate to="/staff/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  // 1. Các Route Công khai (Không cần đăng nhập)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/access-denied",
    element: <AccessDeniedPage />,
  },
  {
    path: "*", // Bắt tất cả các link sai (404)
    element: <NotFoundPage />,
  },

  // 2. Các Route Đã Đăng nhập (Bảo vệ cấp 1)
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        // Áp dụng MainLayout (Sidebar + Navbar Bootstrap) cho tất cả các trang bên trong
        element: <MainLayout />,
        children: [
          // Trang chủ mặc định: Tự động chuyển hướng
          { index: true, element: <RedirectToRoleDashboard /> },

          // --- KHU VỰC SUPER ADMIN (Bảo vệ cấp 2: Chỉ SUPER_ADMIN) ---
          {
            path: "admin",
            element: <RoleRoute requiredRole={Role.SUPER_ADMIN} />,
            children: [
              { path: "dashboard", element: <AdminDashboard /> },
              { path: "branches", element: <BranchManagementPage /> },
              { path: "managers", element: <ManagerAccountsPage /> },
            ],
          },

          // --- KHU VỰC MANAGER (Bảo vệ cấp 2: Chỉ MANAGER) ---
          {
            path: "manager",
            element: <RoleRoute requiredRole={Role.MANAGER} />,
            children: [
              { path: "dashboard", element: <ManagerDashboard /> },
              { path: "staff", element: <StaffListPage /> },
              { path: "staff/:id", element: <StaffProfilePage /> }, // Xem chi tiết NV
              { path: "schedule", element: <SchedulePage /> },
              { path: "requests", element: <RequestsPage /> },
              { path: "timesheet", element: <TimesheetPage /> },
              { path: "payroll", element: <PayrollPage /> },
              { path: "operations", element: <OperationsPage /> },
              { path: "communication", element: <CommunicationPage /> },
              { path: "audit", element: <AuditLogPage /> },
            ],
          },

          // --- KHU VỰC STAFF (Bảo vệ cấp 2: Chỉ STAFF) ---
          {
            path: "staff",
            element: <RoleRoute requiredRole={Role.STAFF} />,
            children: [
              { path: "dashboard", element: <StaffDashboard /> },
              { path: "schedule", element: <MySchedulePage /> },
              { path: "tasks", element: <MyTasksPage /> },
              { path: "payroll", element: <MyPayrollPage /> },
              { path: "timesheet", element: <MyTasksPage /> }, // (Tạm dùng chung hoặc tạo trang riêng)
              { path: "profile", element: <MyProfilePage /> },
              { path: "feedback", element: <FeedbackPage /> },
              { path: "check-in", element: <CheckInOutPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
