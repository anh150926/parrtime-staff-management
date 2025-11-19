/* file: frontend/src/pages/staff/CheckInOutPage.tsx */
import React, { useState, useEffect } from "react";
import { timesheetApi } from "../../api/timesheetApi";
import { scheduleApi } from "../../api/scheduleApi";
import { Button } from "../../components/shared/Button";
import { ScheduleViewDto } from "../../models/Schedule";

export const CheckInOutPage: React.FC = () => {
  const [todayShifts, setTodayShifts] = useState<ScheduleViewDto[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);

  useEffect(() => {
    // Lấy lịch hôm nay để staff chọn ca check-in
    const today = new Date().toISOString().split("T")[0];
    scheduleApi.getScheduleForWeek(today).then((data) => {
      // Lọc lấy ca của ngày hôm nay (giả sử API trả về cả tuần)
      const todayData = data.filter((s) => s.shiftDate === today);
      setTodayShifts(todayData);
    });
  }, []);

  const handleCheckIn = async () => {
    if (!selectedShiftId) {
      alert("Vui lòng chọn ca làm việc để Check-in!");
      return;
    }
    try {
      // Trong thực tế, cần lấy assignmentId từ selectedShiftId
      // Ở đây giả lập gửi selectedShiftId (cần BE hỗ trợ tìm assignment từ scheduleId + userId)
      await timesheetApi.checkIn({ assignmentId: selectedShiftId });
      alert("Check-in thành công! Chúc bạn làm việc tốt.");
    } catch (e) {
      alert("Lỗi Check-in (Có thể bạn chưa được gán vào ca này).");
    }
  };

  const handleCheckOut = async () => {
    try {
      await timesheetApi.checkOut();
      alert("Check-out thành công! Hẹn gặp lại.");
    } catch (e) {
      alert("Lỗi: Bạn chưa Check-in hoặc đã Check-out rồi.");
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: "70vh" }}
    >
      <h1 className="fw-bold mb-2">Chấm Công</h1>
      <p className="text-muted mb-5">
        Ngày: {new Date().toLocaleDateString("vi-VN")}
      </p>

      <div className="mb-4 w-100" style={{ maxWidth: "400px" }}>
        <label className="form-label fw-bold">Chọn Ca làm việc:</label>
        <select
          className="form-select mb-3"
          onChange={(e) => setSelectedShiftId(parseInt(e.target.value))}
        >
          <option value="">-- Chọn ca --</option>
          {todayShifts.map((s) => (
            <option key={s.scheduleId} value={s.scheduleId}>
              {s.shiftName} ({s.startTime} - {s.endTime})
            </option>
          ))}
        </select>
      </div>

      <div className="d-flex gap-4">
        <div className="text-center">
          <div
            className="card border-0 shadow-sm mb-3 p-4 d-flex align-items-center justify-content-center bg-success-subtle"
            style={{ width: "160px", height: "160px", borderRadius: "20px" }}
          >
            <i className="bi bi-fingerprint text-success display-1"></i>
          </div>
          <Button
            variant="success"
            size="lg"
            className="w-100"
            onClick={handleCheckIn}
          >
            VÀO CA
          </Button>
        </div>

        <div className="text-center">
          <div
            className="card border-0 shadow-sm mb-3 p-4 d-flex align-items-center justify-content-center bg-danger-subtle"
            style={{ width: "160px", height: "160px", borderRadius: "20px" }}
          >
            <i className="bi bi-box-arrow-right text-danger display-1"></i>
          </div>
          <Button
            variant="danger"
            size="lg"
            className="w-100"
            onClick={handleCheckOut}
          >
            TAN CA
          </Button>
        </div>
      </div>
    </div>
  );
};
