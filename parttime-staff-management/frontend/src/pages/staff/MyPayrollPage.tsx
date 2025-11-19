/* file: frontend/src/pages/staff/MyPayrollPage.tsx */
import React, { useState } from "react";
import { payrollApi } from "../../api/payrollApi";
import { PayrollDto } from "../../models/Payroll";
import { Button } from "../../components/shared/Button";
import { Spinner } from "../../components/shared/Spinner";

export const MyPayrollPage: React.FC = () => {
  const [payroll, setPayroll] = useState<PayrollDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleViewPayroll = async () => {
    setLoading(true);
    try {
      const data = await payrollApi.getMyPayroll(month, year);
      setPayroll(data);
    } catch (e) {
      setPayroll(null);
      alert("Chưa có dữ liệu lương cho tháng này.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <h2 className="fw-bold mb-4">Phiếu Lương</h2>

      {/* Filter */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body d-flex gap-3 align-items-end">
          <div className="flex-grow-1">
            <label className="form-label fw-bold">Tháng</label>
            <select
              className="form-select"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-grow-1">
            <label className="form-label fw-bold">Năm</label>
            <select
              className="form-select"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <Button onClick={handleViewPayroll} isLoading={loading}>
            Xem Lương
          </Button>
        </div>
      </div>

      {/* Result */}
      {payroll ? (
        <div className="card shadow-sm border-0 border-top border-4 border-success">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <h4 className="text-uppercase text-muted mb-1">
                PHIẾU LƯƠNG THÁNG {payroll.month}/{payroll.year}
              </h4>
              <h1 className="fw-bold text-success display-4">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(payroll.finalPay)}
              </h1>
              <span className="badge bg-success rounded-pill px-3">
                Đã chốt
              </span>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Tổng giờ làm:</span>{" "}
                    <strong>{payroll.totalWorkHours}h</strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Lương cơ bản:</span>{" "}
                    <strong>
                      {new Intl.NumberFormat("vi-VN").format(payroll.basePay)} ₫
                    </strong>
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between text-success">
                    <span>Thưởng (+):</span>{" "}
                    <strong>
                      {new Intl.NumberFormat("vi-VN").format(
                        payroll.totalBonus
                      )}{" "}
                      ₫
                    </strong>
                  </li>
                  <li className="list-group-item d-flex justify-content-between text-danger">
                    <span>Phạt (-):</span>{" "}
                    <strong>
                      {new Intl.NumberFormat("vi-VN").format(
                        payroll.totalPenalty
                      )}{" "}
                      ₫
                    </strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="text-center text-muted py-5">
            Vui lòng chọn tháng để xem.
          </div>
        )
      )}
    </div>
  );
};
