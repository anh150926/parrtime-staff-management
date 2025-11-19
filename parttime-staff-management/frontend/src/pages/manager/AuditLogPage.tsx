import React from "react";

export const AuditLogPage: React.FC = () => {
  return (
    <div className="container-fluid p-0">
      <h2 className="fw-bold mb-4">Lịch sử Hoạt động</h2>
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <table className="table table-striped mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Thời gian</th>
                <th>Hành động</th>
                <th>Đối tượng</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ps-4 text-muted">20/11/2025 08:30</td>
                <td>
                  <span className="badge bg-primary">EDIT_TIMESHEET</span>
                </td>
                <td>WorkLog_15</td>
                <td>Sửa giờ check-in NV A từ 8:00 thành 8:15</td>
              </tr>
              {/* ... */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
