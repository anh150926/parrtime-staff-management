/*
 * file: frontend/src/components/modals/SelectEmployeesModal.tsx
 *
 * Modal bật lên khi Manager click vào 1 ô trong Bảng 7x2 (Module 2).
 */

import React, { useState, useEffect } from "react";
import { schedulingApi } from "../../api/schedulingApi";
import { RegisteredEmployeeDto } from "../../models/Schedule";
import { DayOfWeekEnum, ShiftType } from "../../models/Enums";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedIds: number[]) => void;
  shiftInfo: {
    restaurantId: number;
    weekStartDate: string;
    dayOfWeek: DayOfWeekEnum;
    shiftType: ShiftType;
  };
}

export const SelectEmployeesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  shiftInfo,
}) => {
  const [employees, setEmployees] = useState<RegisteredEmployeeDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await schedulingApi.getRegisteredEmployees(
          shiftInfo.restaurantId,
          shiftInfo.weekStartDate,
          shiftInfo.dayOfWeek,
          shiftInfo.shiftType
        );
        setEmployees(data);
        setSelectedIds(new Set());
      } catch (err) {
        setError("Không thể tải danh sách nhân viên đăng ký.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [isOpen, shiftInfo]);

  const handleToggle = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSave = () => {
    onSave(Array.from(selectedIds));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>
          Chọn nhân viên cho ca: {shiftInfo.dayOfWeek} - {shiftInfo.shiftType}
        </h3>

        {loading && <p>Đang tải...</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="employee-list">
          {employees.length === 0 && !loading && (
            <p>Không có nhân viên nào đăng ký ca này.</p>
          )}

          {employees.map((emp) => (
            <div key={emp.employeeId} className="employee-item">
              <input
                type="checkbox"
                id={`emp-${emp.employeeId}`}
                checked={selectedIds.has(emp.employeeId)}
                onChange={() => handleToggle(emp.employeeId)}
              />
              <label htmlFor={`emp-${emp.employeeId}`}>
                {emp.name} (SĐT: {emp.phoneNumber}) -
                <strong>Đã xếp: {emp.totalShiftsScheduled} ca</strong>
              </label>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Hủy</button>
          <button onClick={handleSave}>Lưu lựa chọn</button>
        </div>
      </div>
    </div>
  );
};
