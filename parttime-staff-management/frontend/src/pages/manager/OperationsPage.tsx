import React from "react";

export const OperationsPage: React.FC = () => {
  return (
    <div className="container-fluid p-0">
      <h2 className="fw-bold mb-4">Vận hành & Đào tạo</h2>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold py-3">
              <i className="bi bi-book me-2 text-primary"></i> Sổ tay Vận hành
            </div>
            <div className="card-body">
              <p className="text-muted">
                Quản lý tài liệu, công thức pha chế, quy trình...
              </p>
              <button className="btn btn-outline-primary w-100">
                Quản lý Sổ tay
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white fw-bold py-3">
              <i className="bi bi-list-check me-2 text-success"></i> Checklist
              Công việc
            </div>
            <div className="card-body">
              <p className="text-muted">
                Tạo danh sách công việc cho từng Ca làm (Sáng/Tối).
              </p>
              <button className="btn btn-outline-success w-100">
                Cấu hình Checklist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
