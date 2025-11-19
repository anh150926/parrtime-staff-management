/* file: frontend/src/pages/staff/StaffDashboard.tsx */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../../api/dashboardApi";
import { StaffDashboardDto } from "../../models/Dashboard";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../../components/shared/Spinner";

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StaffDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStaffDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid p-0">
      {/* Header Section */}
      <div className="bg-primary text-white p-4 rounded-3 mb-4 shadow-sm d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-1">Xin chào, {user?.fullName}! 👋</h2>
          <p className="mb-0 opacity-75">
            Chúc bạn một ngày làm việc hiệu quả.
          </p>
        </div>
        <Link
          to="/staff/check-in"
          className="btn btn-light text-primary fw-bold shadow-sm"
        >
          <i className="bi bi-qr-code me-2"></i>Chấm công ngay
        </Link>
      </div>

      <div className="row g-4">
        {/* Upcoming Shift Card */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold py-3 border-bottom d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-calendar-event me-2 text-primary"></i> Ca
                làm sắp tới
              </span>
              <Link to="/staff/schedule" className="text-decoration-none small">
                Xem lịch
              </Link>
            </div>
            <div className="card-body">
              {data?.upcomingShift ? (
                <div className="text-center py-3">
                  <h4 className="text-primary fw-bold mb-1">
                    {data.upcomingShift.shiftName}
                  </h4>
                  <p className="text-muted mb-3">
                    {new Date(data.upcomingShift.shiftDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                  <div className="badge bg-light text-dark border p-2 fs-6">
                    ⏰ {data.upcomingShift.startTime.slice(0, 5)} -{" "}
                    {data.upcomingShift.endTime.slice(0, 5)}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-calendar-x display-4 d-block mb-2 opacity-50"></i>
                  Bạn không có ca làm nào sắp tới.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold py-3 border-bottom">
              <i className="bi bi-activity me-2 text-success"></i> Trạng thái
              yêu cầu
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>
                    <i className="bi bi-envelope me-2 text-warning"></i> Đơn xin
                    nghỉ đang chờ
                  </span>
                  <span className="badge bg-warning text-dark rounded-pill">
                    {data?.pendingLeaveRequests || 0}
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>
                    <i className="bi bi-arrow-left-right me-2 text-info"></i>{" "}
                    Yêu cầu đổi ca đang chờ
                  </span>
                  <span className="badge bg-info text-dark rounded-pill">
                    {data?.pendingShiftMarketRequests || 0}
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span>
                    <i className="bi bi-bell me-2 text-danger"></i> Thông báo
                    mới
                  </span>
                  <span className="badge bg-danger rounded-pill">
                    {data?.unreadAnnouncements || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
