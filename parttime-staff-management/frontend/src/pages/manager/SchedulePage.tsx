import React, { useState } from "react";
import { Button } from "../../components/shared/Button";

export const SchedulePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("schedule");

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Quản lý Lịch làm</h2>
        {activeTab === "schedule" ? (
          <Button variant="primary" icon="bi-calendar-plus">
            Tạo Ca Trống
          </Button>
        ) : (
          <Button variant="outline-primary" icon="bi-plus-lg">
            Thêm Mẫu Ca
          </Button>
        )}
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "schedule" ? "active fw-bold" : "text-muted"
                }`}
                onClick={() => setActiveTab("schedule")}
              >
                Lịch Tổng (Phân ca)
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "templates" ? "active fw-bold" : "text-muted"
                }`}
                onClick={() => setActiveTab("templates")}
              >
                Mẫu Ca (Templates)
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-4 text-center">
          {activeTab === "schedule" ? (
            <div className="py-5 text-muted">
              <i className="bi bi-calendar-week display-1 mb-3 d-block"></i>
              <p>Component Lịch Tổng sẽ hiển thị ở đây (Grid Lịch 7 ngày).</p>
            </div>
          ) : (
            <div className="py-5 text-muted">
              <i className="bi bi-grid display-1 mb-3 d-block"></i>
              <p>Danh sách Mẫu ca (Sáng, Chiều, Tối) sẽ hiển thị ở đây.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
