/*
 * file: frontend/src/pages/CheckInOutPage.tsx
 */
import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { worklogApi, WorkLogResponse } from "../api/worklogApi";
import { ShiftType } from "../models/Enums";

const ACTIVE_WORKLOG_KEY = "active_worklog";

export const CheckInOutPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeLog, setActiveLog] = useState<WorkLogResponse | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftType>(ShiftType.CA_1);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedLog = localStorage.getItem(ACTIVE_WORKLOG_KEY);
    if (savedLog) {
      const logData: WorkLogResponse = JSON.parse(savedLog);
      if (logData.employeeId === user?.id) {
        setActiveLog(logData);
      } else {
        localStorage.removeItem(ACTIVE_WORKLOG_KEY);
      }
    }
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const requestData = {
        employeeId: user.id,
        shiftDate: selectedDate,
        shiftType: selectedShift,
      };
      const logData = await worklogApi.checkIn(requestData);
      setActiveLog(logData);
      localStorage.setItem(ACTIVE_WORKLOG_KEY, JSON.stringify(logData));
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi check-in.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeLog) return;
    setLoading(true);
    setError(null);
    try {
      const logData = await worklogApi.checkOut(activeLog.workLogId);
      setActiveLog(null);
      localStorage.removeItem(ACTIVE_WORKLOG_KEY);
      alert(`Check-out thành công! Giờ làm: ${logData.actualHours || 0} giờ.`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi check-out.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p>Vui lòng đăng nhập để chấm công.</p>;
  }

  if (activeLog) {
    return (
      <div className="page-container check-in-page active-shift">
        <h2>Bạn đang trong ca...</h2>
        {error && <p className="error-message">{error}</p>}
        <div>
          <p>
            <strong>Nhân viên:</strong> {activeLog.employeeName}
          </p>
          <p>
            <strong>Ngày ca:</strong> {activeLog.shiftDate}
          </p>
          <p>
            <strong>Loại ca:</strong> {activeLog.shiftType}
          </p>
          <p>
            <strong>Check-in lúc:</strong>{" "}
            {new Date(activeLog.checkIn).toLocaleTimeString()}
          </p>
        </div>
        <button
          className="checkout-button"
          onClick={handleCheckOut}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "BẤM ĐỂ CHECK-OUT"}
        </button>
      </div>
    );
  }

  return (
    <div className="page-container check-in-page">
      <h2>Chấm công</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="check-in-form">
        <div className="form-group">
          <label htmlFor="shiftDate">Ngày làm:</label>
          <input
            type="date"
            id="shiftDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="shiftType">Chọn ca:</label>
          <select
            id="shiftType"
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value as ShiftType)}
          >
            <option value={ShiftType.CA_1}>Ca 1 (8h - 16h)</option>
            <option value={ShiftType.CA_2}>Ca 2 (16h - 00h)</option>
          </select>
        </div>
        <button
          className="checkin-button"
          onClick={handleCheckIn}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "BẤM ĐỂ CHECK-IN"}
        </button>
      </div>
    </div>
  );
};
