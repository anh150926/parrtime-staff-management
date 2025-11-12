/*
 * file: frontend/src/pages/WeeklyPayrollPage.tsx
 */
import React, { useState, useEffect } from "react";
import { payrollApi } from "../api/payrollApi";
import { PayrollSummaryResponse } from "../models/Payroll";
import { PayrollDetailModal } from "../components/modals/PayrollDetailModal";
import { useAuthStore } from "../store/authStore";

interface SelectedEmployeeInfo {
  id: number;
  name: string;
}

export const WeeklyPayrollPage: React.FC = () => {
  const { user } = useAuthStore();
  const [weekRange, setWeekRange] = useState(getPreviousWeekRange());
  const [payrollSummary, setPayrollSummary] = useState<
    PayrollSummaryResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<SelectedEmployeeInfo | null>(null);

  const fetchPayroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await payrollApi.getPayrollSummary(
        weekRange.startDate,
        weekRange.endDate
      );
      setPayrollSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải bảng lương.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [weekRange]);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await payrollApi.calculatePayroll(
        weekRange.startDate,
        weekRange.endDate
      );
      setPayrollSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tính toán lương.");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (employee: PayrollSummaryResponse) => {
    setSelectedEmployee({
      id: employee.employeeId,
      name: employee.employeeName,
    });
    setIsModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (user?.role !== "ROLE_MANAGER") {
    return <p>Bạn không có quyền truy cập trang này.</p>;
  }

  return (
    <div className="page-container">
      <h2>Tính lương hàng tuần</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="payroll-controls">
        <label htmlFor="week-start">Chọn tuần (Ngày bắt đầu):</label>
        <input
          type="date"
          id="week-start"
          value={weekRange.startDate}
          onChange={(e) => setWeekRange(getWeekRangeFromDate(e.target.value))}
        />
        <button onClick={handleCalculate} disabled={loading}>
          {loading ? "Đang tính..." : "Tính lương cho tuần này"}
        </button>
      </div>
      <div className="payroll-summary-table">
        {loading && <p>Đang tải dữ liệu...</p>}
        <table>
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Tên Nhân viên</th>
              <th>SĐT</th>
              <th>Giờ (Base/OT)</th>
              <th>Phút (Trễ/Sớm)</th>
              <th>Tiền Lương</th>
              <th>Tiền OT</th>
              <th>Tiền Phạt</th>
              <th>Tổng Nhận</th>
            </tr>
          </thead>
          <tbody>
            {payrollSummary.map((row) => (
              <tr
                key={row.employeeId}
                onClick={() => handleRowClick(row)}
                className="clickable-row"
              >
                <td>{row.employeeCode}</td>
                <td>{row.employeeName}</td>
                <td>{row.phoneNumber}</td>
                <td>
                  {row.totalBaseHours} / {row.totalOvertimeHours}
                </td>
                <td>{row.totalLateAndEarlyMinutes}</td>
                <td>{formatCurrency(row.basePay)}</td>
                <td>{formatCurrency(row.overtimePay)}</td>
                <td>{formatCurrency(row.totalPenalty)}</td>
                <td>
                  <strong>{formatCurrency(row.finalPay)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedEmployee && (
        <PayrollDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
          weekRange={weekRange}
        />
      )}
    </div>
  );
};

// --- Tiện ích Date ---
function getWeekRangeFromDate(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    startDate: monday.toISOString().split("T")[0],
    endDate: sunday.toISOString().split("T")[0],
  };
}
function getPreviousWeekRange() {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  return getWeekRangeFromDate(lastWeek.toISOString().split("T")[0]);
}
