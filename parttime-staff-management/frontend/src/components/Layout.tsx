import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { logout } from "../features/auth/authSlice";
import { fetchUnreadCount } from "../features/notifications/notificationSlice";

const Layout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector(
    (state: RootState) => state.notifications
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    // Fetch every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "OWNER":
        return "badge-owner";
      case "MANAGER":
        return "badge-manager";
      default:
        return "badge-staff";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Chủ sở hữu";
      case "MANAGER":
        return "Quản lý";
      default:
        return "Nhân viên";
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-coffee fixed-top">
        <div className="container-fluid">
          <button
            className="btn btn-link text-white d-lg-none me-2"
            onClick={toggleSidebar}
          >
            <i className="bi bi-list fs-4"></i>
          </button>
          <a className="navbar-brand" href="/dashboard">
            <i className="bi bi-cup-hot-fill me-2"></i>
            Coffee House
          </a>

          <div className="d-flex align-items-center">
            {/* Notifications */}
            <div className="dropdown me-3">
              <button
                className="btn btn-link text-white position-relative"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-bell fs-5"></i>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              <div
                className="dropdown-menu dropdown-menu-end"
                style={{ width: "300px" }}
              >
                <h6 className="dropdown-header">Thông báo</h6>
                <div className="dropdown-divider"></div>
                <NavLink
                  to="/notifications"
                  className="dropdown-item text-center"
                >
                  Xem tất cả thông báo
                </NavLink>
              </div>
            </div>

            {/* User Menu */}
            <div className="dropdown">
              <button
                className="btn btn-link text-white d-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                <div className="avatar me-2">
                  {user?.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="d-none d-md-inline">{user?.fullName}</span>
                <i className="bi bi-chevron-down ms-2"></i>
              </button>
              <div className="dropdown-menu dropdown-menu-end">
                <div className="dropdown-header">
                  <strong>{user?.fullName}</strong>
                  <br />
                  <small
                    className={`badge ${getRoleBadgeClass(user?.role || "")}`}
                  >
                    {getRoleLabel(user?.role || "")}
                  </small>
                </div>
                <div className="dropdown-divider"></div>
                <NavLink to="/profile" className="dropdown-item">
                  <i className="bi bi-person me-2"></i>
                  Hồ sơ cá nhân
                </NavLink>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "show" : ""}`}>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className="nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-speedometer2"></i>
            Tổng quan
          </NavLink>

          {/* Owner and Manager can see Users */}
          {(user?.role === "OWNER" || user?.role === "MANAGER") && (
            <NavLink
              to="/users"
              className="nav-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="bi bi-people"></i>
              Nhân viên
            </NavLink>
          )}

          {/* Owner only can see Stores */}
          {user?.role === "OWNER" && (
            <NavLink
              to="/stores"
              className="nav-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="bi bi-shop"></i>
              Cơ sở
            </NavLink>
          )}

          {/* Owner and Manager can see Shifts */}
          {(user?.role === "OWNER" || user?.role === "MANAGER") && (
            <NavLink
              to="/shifts"
              className="nav-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="bi bi-calendar3"></i>
              Lịch làm việc
            </NavLink>
          )}

          {/* Staff can see My Shifts */}
          {user?.role === "STAFF" && (
            <NavLink
              to="/my-shifts"
              className="nav-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="bi bi-calendar-check"></i>
              Ca làm của tôi
            </NavLink>
          )}

          {/* Marketplace for all */}
          <NavLink
            to="/marketplace"
            className="nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-shop-window"></i>
            Chợ Ca
          </NavLink>

          {/* Tasks */}
          <NavLink
            to="/tasks"
            className="nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-list-check"></i>
            Nhiệm vụ
          </NavLink>

          {/* Create Task For Staff - Manager and Owner only */}
          {(user?.role === "OWNER" || user?.role === "MANAGER") && (
            <NavLink
              to="/create-task-for-staff"
              className="nav-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="bi bi-clipboard-check"></i>
              Giao nhiệm vụ
            </NavLink>
          )}

          <NavLink
            to="/requests"
            className="nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-file-earmark-text"></i>
            Yêu cầu
          </NavLink>

          {/* Owner and Manager can see Payrolls */}
          {(user?.role === "OWNER" || user?.role === "MANAGER") && (
            <NavLink
              to="/payrolls"
              className="nav-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="bi bi-cash-stack"></i>
              Bảng lương
            </NavLink>
          )}

          {/* Staff can see their own payroll */}
          {user?.role === "STAFF" && (
            <NavLink
              to="/my-payroll"
              className="nav-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="bi bi-wallet2"></i>
              Lương của tôi
            </NavLink>
          )}

          {/* Owner can see Reports */}
          {user?.role === "OWNER" && (
            <NavLink
              to="/reports"
              className="nav-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="bi bi-bar-chart-line"></i>
              Báo cáo
            </NavLink>
          )}

          {/* Owner can see Employee Rankings */}
          {user?.role === "OWNER" && (
            <NavLink
              to="/rankings"
              className="nav-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="bi bi-trophy"></i>
              Xếp hạng NV
            </NavLink>
          )}

          {/* Complaints - All users */}
          <NavLink
            to="/complaints"
            className="nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-exclamation-triangle"></i>
            Khiếu nại
          </NavLink>

          {/* Notifications for all */}
          <NavLink
            to="/notifications"
            className="nav-link"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-bell"></i>
            Thông báo
            {unreadCount > 0 && (
              <span className="badge bg-danger ms-auto">{unreadCount}</span>
            )}
          </NavLink>
        </nav>
      </div>

      {/* Main Content */}
      <main className="main-content" style={{ marginTop: "56px" }}>
        <Outlet />
      </main>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
