import React from "react";
import { Button } from "../../components/shared/Button";

export const PayrollPage: React.FC = () => {
  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Bảng Lương</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" icon="bi-exclamation-circle">
            Tạo Phạt
          </Button>
          <Button variant="outline-success" icon="bi-gift">
            Tạo Thưởng
          </Button>
          <Button variant="primary" icon="bi-calculator">
            Chốt Lương Tháng
          </Button>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <div className="row align-items-center">
            <div className="col-auto">
              <label className="fw-bold me-2">Chọn tháng:</label>
            </div>
            <div className="col-auto">
              <select className="form-select">
                <option>Tháng 11 / 2025</option>
                <option>Tháng 10 / 2025</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Nhân viên</th>
                <th>Tổng giờ làm</th>
                <th>Lương cơ bản</th>
                <th>Thưởng/Phạt</th>
                <th>Thực nhận</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ps-4 fw-bold">Nguyễn Văn An</td>
                <td>120h</td>
                <td>3.000.000 ₫</td>
                <td>
                  <span className="text-success">+200.000</span> /{" "}
                  <span className="text-danger">-50.000</span>
                </td>
                <td className="fw-bold text-primary">3.150.000 ₫</td>
                <td>
                  <span className="badge bg-warning text-dark">Chưa chốt</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
