/*
 * file: frontend/src/pages/RegisterNextWeekPage.tsx
 */
import React, { useState, useMemo } from "react";
import { useAuthStore } from "../store/authStore";
import { employeeApi } from "../api/employeeApi";
import { availabilityApi } from "../api/availabilityApi";
import { EmployeeSearchResponse } from "../models/Employee";
import { DayOfWeekEnum, ShiftType } from "../models/Enums";
import {
  AvailabilityResponse,
  AvailabilitySlotDto,
} from "../models/Availability";

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

export const RegisterNextWeekPage: React.FC = () => {
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<EmployeeSearchResponse[]>(
    []
  );
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeSearchResponse | null>(
      user
        ? {
            id: user.id,
            name: user.name,
            phoneNumber: "",
            restaurantName: "",
          }
        : null
    );

  const [weekStartDate, setWeekStartDate] = useState(getNextWeekStartDate());
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm) return;
    try {
      const results = await employeeApi.searchByName(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
    }
  };

  const fetchAvailability = async (employeeId: number, dateStr: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await availabilityApi.getAvailability(employeeId, dateStr);
      setAvailability(data);
    } catch (error) {
      setMessage("Không thể tải lịch đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (selectedEmployee) {
      fetchAvailability(selectedEmployee.id, weekStartDate);
    } else {
      setAvailability(null);
    }
  }, [selectedEmployee, weekStartDate]);

  const selectedSlotsSet = useMemo(() => {
    if (!availability) return new Set<string>();
    return new Set(
      availability.slots.map((slot) => `${slot.dayOfWeek}_${slot.shiftType}`)
    );
  }, [availability]);

  const handleSlotToggle = (day: DayOfWeekEnum, shift: ShiftType) => {
    if (!availability) return;
    const slotKey = `${day}_${shift}`;
    const newSlots: AvailabilitySlotDto[] = [...availability.slots];

    if (selectedSlotsSet.has(slotKey)) {
      const index = newSlots.findIndex(
        (s) => s.dayOfWeek === day && s.shiftType === shift
      );
      if (index > -1) newSlots.splice(index, 1);
    } else {
      newSlots.push({ dayOfWeek: day, shiftType: shift });
    }
    setAvailability({ ...availability, slots: newSlots });
  };

  const handleSave = async () => {
    if (!availability || !selectedEmployee) return;
    setLoading(true);
    setMessage(null);
    try {
      const requestData = {
        employeeId: selectedEmployee.id,
        weekStartDate: weekStartDate,
        slots: availability.slots,
      };
      const savedData = await availabilityApi.saveAvailability(requestData);
      setAvailability(savedData);
      setMessage("Đã lưu lịch đăng ký thành công!");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Lỗi! Không thể lưu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>Đăng ký ca làm việc tuần tới</h2>
      <div className="week-selector">
        <label htmlFor="week-start">Chọn tuần:</label>
        <input
          type="date"
          id="week-start"
          value={weekStartDate}
          onChange={(e) => setWeekStartDate(getMonday(e.target.value))}
        />
      </div>

      {user?.role === "ROLE_MANAGER" && (
        <div className="employee-search">
          <input
            type="text"
            placeholder="Tìm tên nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Tìm</button>
          <ul>
            {searchResults.map((emp) => (
              <li key={emp.id} onClick={() => setSelectedEmployee(emp)}>
                {emp.name} ({emp.phoneNumber})
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedEmployee ? (
        <div className="availability-grid">
          <h3>Lịch đăng ký cho: {selectedEmployee.name}</h3>
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
                    const slotKey = `${day}_${shift}`;
                    const isSelected = selectedSlotsSet.has(slotKey);
                    return (
                      <td key={shift}>
                        <input
                          type="checkbox"
                          id={slotKey}
                          checked={isSelected}
                          onChange={() => handleSlotToggle(day, shift)}
                          disabled={loading}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSave} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu lịch đăng ký"}
          </button>
          {message && <p>{message}</p>}
        </div>
      ) : (
        <p>Vui lòng chọn nhân viên để xem lịch.</p>
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
