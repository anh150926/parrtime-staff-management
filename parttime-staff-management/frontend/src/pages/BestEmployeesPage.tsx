/*
 * file: frontend/src/pages/BestEmployeesPage.tsx
 */
import React, { useState } from "react";
import { statsApi } from "../api/statsApi";
import { BestEmployeeResponse } from "../models/Stats";
import { useAuthStore } from "../store/authStore";
import { PayrollDetailModal } from "../components/modals/PayrollDetailModal";

interface DateRange {
  startDate: string;
  endDate: string;
}
interface SelectedEmployeeInfo {
  id: number;
  name: string;
}

export const BestEmployeesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [statsList, setStatsList] = useState<BestEmployeeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<SelectedEmployeeInfo | null>(null);

  const handleFetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsApi.getBestEmployees(
        dateRange.startDate,
        dateRange.endDate
      );
      setStatsList(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải thống kê.");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (employee: BestEmployeeResponse) => {
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
      <h2>Thống kê nhân viên giỏi nhất</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="stats-controls">
        <label htmlFor="start-date">Từ ngày:</label>
        <input
          type="date"
          id="start-date"
          value={dateRange.startDate}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
          }
        />
        <label htmlFor="end-date">Đến ngày:</label>
        <input
          type="date"
          id="end-date"
          value={dateRange.endDate}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
          }
        />
        <button onClick={handleFetchStats} disabled={loading}>
          {loading ? "Đang tải..." : "Xem Thống kê"}
        </button>
      </div>
      <div className="stats-table">
        {loading && <p>Đang tải dữ liệu...</p>}
        <table>
          <thead>
            <tr>
              <th>Xếp hạng</th>
              <th>Tên Nhân viên</th>
              <th>SĐT</th>
              <th>Tổng giờ làm</th>
              <th>Tổng tiền nhận</th>
              <th>Tổng phút (Trễ/Sớm)</th>
              <th>Tổng tiền phạt</th>
            </tr>
          </thead>
          <tbody>
            {statsList.map((row, index) => (
              <tr
                key={row.employeeId}
                onClick={() => handleRowClick(row)}
                className="clickable-row"
              >
                <td>
                  <strong>#{index + 1}</strong>
                </td>
                <td>{row.employeeName}</td>
                <td>{row.phoneNumber}</td>
                <td>{row.totalActualHours.toFixed(2)}</td>
                <td>{formatCurrency(row.totalPay)}</td>
                <td>{row.totalLateAndEarlyMinutes} phút</td>
                <td>{formatCurrency(row.totalPenalty)}</td>
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
          weekRange={dateRange}
        />
      )}
    </div>
  );
};

// --- Tiện ích Date ---
function getDefaultDateRange(): DateRange {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}
