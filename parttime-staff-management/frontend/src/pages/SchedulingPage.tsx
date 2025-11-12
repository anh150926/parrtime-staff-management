/*
 * file: frontend/src/pages/SchedulingPage.tsx
 */
import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { schedulingApi } from "../api/schedulingApi";
import { ScheduleViewResponse, AssignedEmployeeDto } from "../models/Schedule";
import { DayOfWeekEnum, ShiftType } from "../models/Enums";
import { SelectEmployeesModal } from "../components/modals/SelectEmployeesModal";

const DAYS_OF_WEEK: DayOfWeekEnum[] = [
  DayOfWeekEnum.MONDAY,
  DayOfWeekEnum.TUESDAY,
  DayOfWeekEnum.WEDNESDAY,
  DayOfWeekEnum.THURSDAY,
  DayOfWeekEnum.FRIDAY,
  DayOfWeekEnum.SATURDAY,
  DayOfWeekEnum.SUNDAY,
];
const SHIFTS: ShiftType[] = [ShiftType.CA_1, ShiftType.CA_2];

interface SelectedShiftInfo {
  dayOfWeek: DayOfWeekEnum;
  shiftType: ShiftType;
}

export const SchedulingPage: React.FC = () => {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId;

  const [weekStartDate, setWeekStartDate] = useState(getNextWeekStartDate());
  const [scheduleView, setScheduleView] = useState<ScheduleViewResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<SelectedShiftInfo | null>(
    null
  );

  const fetchSchedule = async (date: string) => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await schedulingApi.getWeekSchedule(restaurantId, date);
      setScheduleView(data);
    } catch (err) {
      setError("Không thể tải bảng xếp lịch.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(weekStartDate);
  }, [weekStartDate, restaurantId]);

  const handleCellClick = (day: DayOfWeekEnum, shift: ShiftType) => {
    setSelectedShift({ dayOfWeek: day, shiftType: shift });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (selectedIds: number[]) => {
    if (!restaurantId || !selectedShift) return;
    setLoading(true);
    setIsModalOpen(false);
    try {
      const requestData = {
        restaurantId: restaurantId,
        weekStartDate: weekStartDate,
        dayOfWeek: selectedShift.dayOfWeek,
        shiftType: selectedShift.shiftType,
        selectedEmployeeIds: selectedIds,
      };
      const updatedSchedule = await schedulingApi.assignEmployeesToShift(
        requestData
      );
      setScheduleView(updatedSchedule);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi lưu phân công.");
    } finally {
      setLoading(false);
      setSelectedShift(null);
    }
  };

  const getAssignedEmployeesForCell = (
    day: DayOfWeekEnum,
    shift: ShiftType
  ): AssignedEmployeeDto[] => {
    if (!scheduleView) return [];
    const key = `${day}_${shift}`;
    return scheduleView.shiftAssignments[key] || [];
  };

  if (!user || user.role !== "ROLE_MANAGER") {
    return <p>Bạn không có quyền truy cập trang này.</p>;
  }

  return (
    <div className="page-container">
      <h2>Xếp lịch tuần tới</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="week-selector">
        <label htmlFor="week-start">Chọn tuần:</label>
        <input
          type="date"
          id="week-start"
          value={weekStartDate}
          onChange={(e) => setWeekStartDate(getMonday(e.target.value))}
        />
      </div>
      <div className="schedule-grid">
        {loading && <p>Đang tải lịch...</p>}
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Ca 1 (8h-16h)</th>
              <th>Ca 2 (16h-00h)</th>
            </tr>
          </thead>
          <tbody>
            {DAYS_OF_WEEK.map((day) => (
              <tr key={day}>
                <td>{day}</td>
                {SHIFTS.map((shift) => {
                  const assigned = getAssignedEmployeesForCell(day, shift);
                  return (
                    <td
                      key={shift}
                      className="schedule-cell"
                      onClick={() => handleCellClick(day, shift)}
                    >
                      <ul>
                        {assigned.map((emp) => (
                          <li key={emp.employeeId}>{emp.name}</li>
                        ))}
                      </ul>
                      <span className="employee-count">
                        ({assigned.length} NV)
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedShift && (
        <SelectEmployeesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          shiftInfo={{
            restaurantId: restaurantId!,
            weekStartDate: weekStartDate,
            dayOfWeek: selectedShift.dayOfWeek,
            shiftType: selectedShift.shiftType,
          }}
        />
      )}
    </div>
  );
};

// --- Tiện ích Date ---
function getNextWeekStartDate(): string {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + (7 - today.getDay() + 1));
  return nextWeek.toISOString().split("T")[0];
}
function getMonday(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split("T")[0];
}
