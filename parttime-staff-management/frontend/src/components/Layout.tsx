import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { logout } from "../features/auth/authSlice";
import { fetchNotifications, fetchUnreadCount, markAsRead } from "../features/notifications/notificationSlice";

const Layout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount, notifications, loading } = useSelector(
    (state: RootState) => state.notifications
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workScheduleExpanded, setWorkScheduleExpanded] = useState(true);
  const [tasksExpanded, setTasksExpanded] = useState(true);

  // Auto-expand menu if on work schedule related routes
  useEffect(() => {
    if (
      location.pathname === "/work-schedule" ||
      location.pathname === "/my-shifts" ||
      location.pathname === "/shift-registration" ||
      location.pathname === "/marketplace"
    ) {
      setWorkScheduleExpanded(true);
    }
  }, [location.pathname]);

  // Auto-expand menu if on tasks related routes
  useEffect(() => {
    if (
      location.pathname === "/tasks" ||
      location.pathname === "/create-task-for-staff"
    ) {
      setTasksExpanded(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    dispatch(fetchNotifications());
    // Fetch every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification) return;
    if (!notification.isRead) {
      await dispatch(markAsRead(notification.id));
      dispatch(fetchUnreadCount());
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

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
            {/* Notifications - Show for all users */}
            {(user?.role === "MANAGER" || user?.role === "STAFF") && (
              <div className="dropdown me-3">
                <button
                  className="btn btn-link notification-bell-btn position-relative"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-bell notification-bell-icon"></i>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
              <div
                className="dropdown-menu dropdown-menu-end"
                style={{ width: "300px" }}
              >
                <h6 className="dropdown-header">Thông báo</h6>
                {loading && (
                  <div className="text-center py-2">
                    <div className="spinner-border spinner-border-sm text-coffee" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                {!loading && notifications.length === 0 && (
                  <div className="text-center text-muted py-3 small">
                    <i className="bi bi-bell-slash d-block fs-4 mb-1"></i>
                    Không có thông báo
                  </div>
                )}
                {!loading &&
                  notifications.slice(0, 5).map((n) => (
                    <button
                      key={n.id}
                      className={`dropdown-item d-flex align-items-start ${!n.isRead ? "bg-light" : ""}`}
                      onClick={() => handleNotificationClick(n)}
                      style={{ whiteSpace: "normal", textAlign: "left" }}
                    >
                      <div className={`me-2 ${!n.isRead ? "text-primary" : "text-muted"}`}>
                        <i className={`bi ${n.isRead ? "bi-bell" : "bi-bell-fill"}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className={`fw-semibold ${!n.isRead ? "text-dark" : ""}`}>{n.title}</div>
                        {n.message && <div className="small text-muted">{n.message}</div>}
                        <div className="small text-muted">{new Date(n.createdAt).toLocaleString("vi-VN")}</div>
                      </div>
                    </button>
                  ))}
                <div className="dropdown-divider"></div>
                <NavLink to="/notifications" className="dropdown-item text-center">
                  Xem tất cả
                </NavLink>
              </div>
            </div>
            )}

            {/* User Menu */}
            <div className="dropdown">
              <button
                className="btn btn-link navbar-user-btn d-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="Avatar"
                    className="navbar-user-avatar me-2"
                  />
                ) : (
                  <div className="navbar-user-avatar avatar me-2">
                    {user?.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="navbar-user-name d-none d-md-inline">{user?.fullName}</span>
                <i className="bi bi-chevron-down navbar-user-chevron ms-2"></i>
              </button>
              <div className="dropdown-menu dropdown-menu-end user-dropdown-menu">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{user?.fullName}</div>
                  <div className="user-dropdown-role">
                    <span className={`badge ${getRoleBadgeClass(user?.role || "")}`}>
                      {getRoleLabel(user?.role || "")}
                    </span>
                  </div>
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

          {/* Staff can see Work Schedule with nested menu */}
          {user?.role === "STAFF" && (
            <div className="nav-menu-item">
              <button
                className={`nav-link nav-link-parent ${workScheduleExpanded ? "expanded" : ""}`}
                onClick={() => setWorkScheduleExpanded(!workScheduleExpanded)}
              >
                <i className="bi bi-calendar-week"></i>
                Ca làm của tôi
                <i className={`bi ms-auto ${workScheduleExpanded ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              </button>
              {workScheduleExpanded && (
                <div className="nav-submenu">
                  <NavLink
                    to="/my-shifts"
                    className="nav-link nav-link-sub"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Lịch làm việc
                  </NavLink>
                  <NavLink
                    to="/shift-registration"
                    className="nav-link nav-link-sub"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Đăng ký lịch làm
                  </NavLink>
                  <NavLink
                    to="/marketplace"
                    className="nav-link nav-link-sub"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Chợ Ca
                  </NavLink>
                </div>
              )}
            </div>
          )}

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

          {/* Marketplace for Owner and Manager (Staff can access via Work Schedule) */}
          {(user?.role === "OWNER" || user?.role === "MANAGER") && (
            <NavLink
              to="/marketplace"
              className="nav-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="bi bi-shop-window"></i>
              Chợ Ca
            </NavLink>
          )}

          {/* Tasks - Collapsible menu */}
          <div className="nav-menu-item">
            <button
              className={`nav-link nav-link-parent ${tasksExpanded ? "expanded" : ""}`}
              onClick={() => setTasksExpanded(!tasksExpanded)}
            >
              <i className="bi bi-list-check"></i>
              Nhiệm vụ
              <i className={`bi ms-auto ${tasksExpanded ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
            </button>
            {tasksExpanded && (
              <div className="nav-submenu">
                {/* Giao nhiệm vụ - Manager and Owner only */}
                {(user?.role === "OWNER" || user?.role === "MANAGER") && (
                  <NavLink
                    to="/create-task-for-staff"
                    className="nav-link nav-link-sub"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <i className="bi bi-clipboard-check me-2"></i>
                    Giao nhiệm vụ
                  </NavLink>
                )}
                {/* Bảng nhiệm vụ - All users */}
                <NavLink
                  to="/tasks"
                  className="nav-link nav-link-sub"
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className="bi bi-table me-2"></i>
                  Bảng nhiệm vụ
                </NavLink>
              </div>
            )}
          </div>

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

          {/* Notifications for Manager and Staff */}
          {(user?.role === "MANAGER" || user?.role === "STAFF") && (
            <NavLink
              to="/notifications"
              className="nav-link"
              onClick={() => setSidebarOpen(false)}
              style={{ display: 'block' }}
            >
              <i className="bi bi-bell"></i>
              Thông báo
              {unreadCount > 0 && (
                <span className="badge bg-danger ms-2">{unreadCount}</span>
              )}
            </NavLink>
          )}

          {/* Send Notification for Owner */}
          {user?.role === "OWNER" && (
            <NavLink
              to="/send-notification"
              className="nav-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="bi bi-send"></i>
              Gửi thông báo
            </NavLink>
          )}

        </nav>
      </div>

      {/* Main Content */}
      <main className="main-content" style={{ marginTop: "64px" }}>
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
