import React from "react";

export const CommunicationPage: React.FC = () => {
  return (
    <div className="container-fluid p-0">
      <h2 className="fw-bold mb-4">Giao tiếp & Phản hồi</h2>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold">Thông báo Chung</div>
            <div className="card-body text-center py-5">
              <button className="btn btn-primary mb-3">
                <i className="bi bi-megaphone-fill me-2"></i>Tạo Thông báo Mới
              </button>
              <p className="text-muted small">
                Gửi thông báo đến toàn bộ nhân viên cơ sở.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold">
              Hòm thư Khiếu nại
            </div>
            <div className="card-body text-center py-5">
              <h2 className="text-danger mb-0">0</h2>
              <p className="text-muted">khiếu nại chưa giải quyết</p>
              <button className="btn btn-outline-dark">Xem danh sách</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
