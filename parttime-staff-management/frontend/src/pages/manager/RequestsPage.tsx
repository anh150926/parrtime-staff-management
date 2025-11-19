/* file: frontend/src/pages/manager/RequestsPage.tsx */
import React from "react";

export const RequestsPage: React.FC = () => {
  return (
    <div>
      <h2 className="fw-bold mb-4">Duyệt Yêu Cầu</h2>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className="nav-link active">Đơn xin nghỉ</button>
        </li>
        <li className="nav-item">
          <button className="nav-link">Đăng ký Ca</button>
        </li>
        <li className="nav-item">
          <button className="nav-link">Chợ Ca (Đổi ca)</button>
        </li>
      </ul>

      <div className="card shadow-sm border-0 p-4 text-center text-muted">
        <i className="bi bi-inbox display-4 mb-3"></i>
        <p>Chọn một tab để xem các yêu cầu đang chờ duyệt.</p>
        {/* TODO: Gọi requestApi và hiển thị danh sách */}
      </div>
    </div>
  );
};
