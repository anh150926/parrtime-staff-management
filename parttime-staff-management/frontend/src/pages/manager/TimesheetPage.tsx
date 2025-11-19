import React from "react";

export const TimesheetPage: React.FC = () => {
  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Bảng Chấm công</h2>
        <div className="d-flex gap-2">
          <input type="date" className="form-control" />
          <button className="btn btn-primary">Xem</button>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Ngày</th>
                  <th>Nhân viên</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Giờ làm</th>
                  <th>Đi muộn</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ps-4">20/11/2025</td>
                  <td className="fw-bold">Nguyễn Văn An</td>
                  <td>07:55</td>
                  <td>16:05</td>
                  <td>8.1h</td>
                  <td>0p</td>
                  <td>
                    <button className="btn btn-sm btn-link">Sửa</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
