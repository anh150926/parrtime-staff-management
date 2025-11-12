/*
 * file: frontend/src/components/modals/PayrollDetailModal.tsx
 *
 * Modal hiển thị chi tiết lương (Module 3 & 4).
 */

import React, { useState, useEffect } from "react";
import { payrollApi } from "../../api/payrollApi";
import { PayrollDetailResponse } from "../../models/Payroll";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  employeeName: string;
  weekRange: {
    startDate: string;
    endDate: string;
  };
}

export const PayrollDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  weekRange,
}) => {
  const [details, setDetails] = useState<PayrollDetailResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await payrollApi.getPayrollDetail(
          employeeId,
          weekRange.startDate,
          weekRange.endDate
        );
        setDetails(data);
      } catch (err) {
        setError("Không thể tải chi tiết lương.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, employeeId, weekRange]);

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <h3>
          Chi tiết ({weekRange.startDate} - {weekRange.endDate})
        </h3>
        <h4>Nhân viên: {employeeName}</h4>

        {loading && <p>Đang tải...</p>}
        {error && <p className="error-message">{error}</p>}

        <table className="payroll-detail-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Ca</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Giờ (Base/OT)</th>
              <th>Phút (Trễ/Sớm)</th>
              <th>Tiền Lương</th>
              <th>Tiền OT</th>
              <th>Tiền Phạt</th>
              <th>Tổng Ca</th>
            </tr>
          </thead>
          <tbody>
            {details.map((row, index) => (
              <tr key={index}>
                <td>
                  {row.shiftDate} ({row.dayOfWeek})
                </td>
                <td>{row.shift.replace("_", " ")}</td>
                <td>
                  {row.checkIn
                    ? new Date(row.checkIn).toLocaleTimeString()
                    : "N/A"}
                </td>
                <td>
                  {row.checkOut
                    ? new Date(row.checkOut).toLocaleTimeString()
                    : "N/A"}
                </td>
                <td>
                  {row.baseHours} / {row.overtimeHours}
                </td>
                <td>{row.lateAndEarlyMinutes}</td>
                <td>{formatCurrency(row.basePay)}</td>
                <td>{formatCurrency(row.overtimePay)}</td>
                <td>{formatCurrency(row.penaltyAmount)}</td>
                <td>
                  <strong>{formatCurrency(row.totalPayForShift)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="modal-actions">
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};
