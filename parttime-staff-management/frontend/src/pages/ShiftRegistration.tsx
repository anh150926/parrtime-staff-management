import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import shiftService, { Shift } from "../api/shiftService";
import Loading from "../components/Loading";
import Toast from "../components/Toast";
import { formatTime } from "../utils/formatters";

interface ShiftRegistrationProps {
  hideHeader?: boolean;
}

const ShiftRegistration: React.FC<ShiftRegistrationProps> = ({ hideHeader = false }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { stores } = useSelector((state: RootState) => state.stores);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (user?.storeId) {
      loadData();
    }
  }, [user?.storeId, weekStart]);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function getDayName(dayOfWeek: number): string {
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return days[dayOfWeek === 7 ? 0 : dayOfWeek];
  }

  function getShiftTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      MORNING: "Ca sáng",
      AFTERNOON: "Ca chiều",
      EVENING: "Ca tối"
    };
    return labels[type] || type;
  }

  function getShiftTypeFromTime(startTime: string): string {
    const hour = new Date(startTime).getHours();
    if (hour < 12) return 'MORNING';
    if (hour < 18) return 'AFTERNOON';
    return 'EVENING';
  }

  const loadData = async () => {
    if (!user?.storeId) return;
    
    setLoading(true);
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59);
      
      const startDateStr = weekStart.toISOString();
      const endDateStr = weekEnd.toISOString();
      
      const [shiftsRes, myShiftsRes] = await Promise.all([
        shiftService.getShiftsForRegistration(user.storeId, startDateStr, endDateStr),
        shiftService.getMyShifts(startDateStr)
      ]);
      
      setShifts(shiftsRes.data || []);
      setMyShifts(myShiftsRes.data || []);
    } catch (error: any) {
      setToast({
        show: true,
        message: error?.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu!",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (shift: Shift) => {
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const shiftDate = new Date(shift.startDatetime);
    shiftDate.setHours(0, 0, 0, 0);
    
    if (shiftDate < today) {
      setToast({
        show: true,
        message: "Không thể đăng ký ca đã qua. Chỉ có thể đăng ký ca trong tương lai.",
        type: "error"
      });
      return;
    }

    try {
      await shiftService.registerForShift(shift.id);
      
      setToast({
        show: true,
        message: `Đăng ký ca "${shift.title}" thành công!`,
        type: "success"
      });
      
      // Reload data
      await loadData();
    } catch (error: any) {
      setToast({
        show: true,
        message: error?.response?.data?.message || "Đăng ký thất bại!",
        type: "error"
      });
    }
  };

  const isRegistered = (shiftId: number): boolean => {
    return myShifts.some(shift => shift.id === shiftId);
  };

  const getMyAssignment = (shift: Shift) => {
    if (!shift.assignments) return null;
    return shift.assignments.find(a => a.userId === user?.id);
  };

  const getShiftsForDayAndType = (day: number, shiftType: string): Shift[] => {
    const date = getDateForDay(day);
    const dateStr = formatDate(date);
    
    return shifts.filter((shift: Shift) => {
      const shiftDate = new Date(shift.startDatetime);
      const shiftDateStr = formatDate(shiftDate);
      
      // Check if shift is on this day
      if (shiftDateStr !== dateStr) return false;
      
      // Check if shift type matches
      const shiftTypeFromTime = getShiftTypeFromTime(shift.startDatetime);
      return shiftTypeFromTime === shiftType;
    }).sort((a, b) => {
      const timeA = new Date(a.startDatetime).getTime();
      const timeB = new Date(b.startDatetime).getTime();
      return timeA - timeB;
    });
  };

  const getDateForDay = (dayOfWeek: number): Date => {
    const date = new Date(weekStart);
    const diff = dayOfWeek - 1; // dayOfWeek is 1-7, we need 0-6
    date.setDate(date.getDate() + diff);
    return date;
  };

  if (loading) {
    return <Loading />;
  }

  const weekDays = [1, 2, 3, 4, 5, 6, 7]; // Monday to Sunday

  return (
    <div>
      {!hideHeader && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">Đăng ký lịch làm</h2>
            <p className="text-muted mb-0">
              Đăng ký ca làm việc của bạn
            </p>
          </div>
        </div>
      )}

      {/* Week Navigation */}
      <div className="card card-coffee mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <button
              className="btn btn-outline-coffee"
              onClick={() => {
                const newWeek = new Date(weekStart);
                newWeek.setDate(newWeek.getDate() - 7);
                setWeekStart(newWeek);
              }}
            >
              <i className="bi bi-chevron-left me-2"></i>
              Tuần trước
            </button>
            <div className="text-center">
              <h5 className="mb-0">
                Tuần {weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} -{" "}
                {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </h5>
            </div>
            <button
              className="btn btn-outline-coffee"
              onClick={() => {
                const newWeek = new Date(weekStart);
                newWeek.setDate(newWeek.getDate() + 7);
                setWeekStart(newWeek);
              }}
            >
              Tuần sau
              <i className="bi bi-chevron-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Week Table */}
      <div className="card card-coffee">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "120px" }}>Ca làm</th>
                  {weekDays.map(day => {
                    const date = getDateForDay(day);
                    const isToday = formatDate(date) === formatDate(new Date());
                    return (
                      <th
                        key={day}
                        className={`text-center ${isToday ? "bg-light" : ""}`}
                        style={{ minWidth: "150px" }}
                      >
                        <div>{getDayName(day)}</div>
                        <div className="small text-muted">
                          {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {["MORNING", "AFTERNOON", "EVENING"].map(shiftType => {
                  const shiftTypeLabels: Record<string, string> = {
                    MORNING: "Ca sáng",
                    AFTERNOON: "Ca chiều",
                    EVENING: "Ca tối"
                  };

                  return (
                    <tr key={shiftType}>
                      <td className="align-middle fw-bold">
                        {shiftTypeLabels[shiftType]}
                      </td>
                      {weekDays.map(day => {
                        const dayShifts = getShiftsForDayAndType(day, shiftType);
                        
                        return (
                          <td key={day} className="text-center align-middle" style={{ verticalAlign: 'top' }}>
                            {dayShifts.map(shift => {
                              const registered = isRegistered(shift.id);
                              const assignment = getMyAssignment(shift);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const shiftDate = new Date(shift.startDatetime);
                              shiftDate.setHours(0, 0, 0, 0);
                              const isPast = shiftDate < today;
                                  const assignedCount = shift.assignments?.filter((a: any) => a.status === 'CONFIRMED').length || 0;
                                  const registeredCount = shift.assignments?.filter((a: any) => a.status === 'ASSIGNED').length || 0;
                                  const requiredSlots = shift.requiredSlots || 1;
                              
                              return (
                                <div key={shift.id} className="mb-2 p-2 border rounded bg-light">
                                  <div className="small fw-bold mb-1">{shift.title}</div>
                                  <div className="small text-muted mb-1">
                                    {formatTime(shift.startDatetime)} - {formatTime(shift.endDatetime)}
                                  </div>
                                  <div className="small mb-1">
                                    <span className="badge bg-info">
                                      Cần {requiredSlots} người
                                    </span>
                                    {registeredCount > 0 && (
                                      <span className="badge bg-secondary ms-1">
                                        {registeredCount} người đã đăng ký
                                      </span>
                                    )}
                                  </div>
                                  {(() => {
                                    if (registered && assignment) {
                                      const status = assignment.status;
                                      if (status === 'CONFIRMED') {
                                        return (
                                          <span className="badge bg-success">
                                            <i className="bi bi-check-circle me-1"></i>
                                            Đã xác nhận
                                          </span>
                                        );
                                      } else if (status === 'DECLINED') {
                                        return (
                                          <span className="badge bg-danger">
                                            <i className="bi bi-x-circle me-1"></i>
                                            Đã từ chối
                                          </span>
                                        );
                                      } else {
                                        return (
                                          <span className="badge bg-warning">
                                            <i className="bi bi-clock me-1"></i>
                                            Chờ xác nhận
                                          </span>
                                        );
                                      }
                                    } else if (isPast) {
                                      return (
                                        <span className="badge bg-secondary">
                                          <i className="bi bi-lock me-1"></i>
                                          Đã qua
                                        </span>
                                      );
                                    } else {
                                      return (
                                        <button
                                          className="btn btn-sm btn-coffee w-100"
                                          onClick={() => handleRegister(shift)}
                                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                                        >
                                          <i className="bi bi-check-lg me-1"></i>
                                          Đăng ký
                                        </button>
                                      );
                                    }
                                  })()}
                                </div>
                              );
                            })}
                            {dayShifts.length === 0 && (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default ShiftRegistration;
