/* file: frontend/src/pages/manager/ManagerDashboard.tsx */
import React from "react";
import { useManagerDashboard } from "../../hooks/useManagerDashboard";
import { Spinner } from "../../components/shared/Spinner";

export const ManagerDashboard: React.FC = () => {
  const { data, loading } = useManagerDashboard();

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="mb-4 fw-bold">Tổng quan Cơ sở</h2>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-white shadow-sm border-0 border-start border-4 border-warning h-100">
            <div className="card-body text-center">
              <h3 className="fw-bold text-warning mb-0">
                {data?.pendingLeaveRequests}
              </h3>
              <small className="text-muted text-uppercase fw-bold">
                Đơn nghỉ chờ duyệt
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-white shadow-sm border-0 border-start border-4 border-info h-100">
            <div className="card-body text-center">
              <h3 className="fw-bold text-info mb-0">
                {data?.pendingShiftMarket}
              </h3>
              <small className="text-muted text-uppercase fw-bold">
                Yêu cầu đổi ca
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-white shadow-sm border-0 border-start border-4 border-primary h-100">
            <div className="card-body text-center">
              <h3 className="fw-bold text-primary mb-0">{data?.totalStaff}</h3>
              <small className="text-muted text-uppercase fw-bold">
                Nhân viên
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-white shadow-sm border-0 border-start border-4 border-success h-100">
            <div className="card-body text-center">
              <h3 className="fw-bold text-success mb-0">
                {data?.attendanceRate}%
              </h3>
              <small className="text-muted text-uppercase fw-bold">
                Tỷ lệ Chuyên cần
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white fw-bold py-3">
          <i className="bi bi-calendar-check me-2"></i>Lịch làm việc hôm nay
        </div>
        <div className="card-body p-0">
          {/* (Hiển thị danh sách ca làm hôm nay) */}
          {data?.todaySchedules && data.todaySchedules.length > 0 ? (
            <ul className="list-group list-group-flush">
              {data.todaySchedules.map((s) => (
                <li
                  key={s.scheduleId}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>
                    <strong>{s.shiftName}</strong> ({s.startTime.slice(0, 5)} -{" "}
                    {s.endTime.slice(0, 5)})
                  </span>
                  <span className="badge bg-primary rounded-pill">
                    {s.assignedStaffCount}/{s.requiredStaff} Nhân viên
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-muted">
              Hôm nay không có ca làm nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
