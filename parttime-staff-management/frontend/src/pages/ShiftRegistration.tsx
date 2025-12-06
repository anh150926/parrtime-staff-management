import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import shiftRegistrationService, { ShiftTemplate, ShiftRegistration as ShiftRegistrationData } from "../api/shiftRegistrationService";
import Loading from "../components/Loading";
import Toast from "../components/Toast";

interface ShiftRegistrationProps {
  hideHeader?: boolean;
}

const ShiftRegistration: React.FC<ShiftRegistrationProps> = ({ hideHeader = false }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { stores } = useSelector((state: RootState) => state.stores);

  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<ShiftRegistrationData[]>([]);
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

  function getShiftTypeOrder(type: string): number {
    const order: Record<string, number> = {
      MORNING: 1,
      AFTERNOON: 2,
      EVENING: 3
    };
    return order[type] || 99;
  }

  const loadData = async () => {
    if (!user?.storeId) return;
    
    setLoading(true);
    try {
      const [templatesRes, registrationsRes] = await Promise.all([
        shiftRegistrationService.getShiftTemplates(user.storeId),
        shiftRegistrationService.getMyRegistrationsForWeek(formatDate(weekStart))
      ]);
      
      setTemplates(templatesRes.data || []);
      setMyRegistrations(registrationsRes.data || []);
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

  const handleRegister = async (template: ShiftTemplate, date: Date) => {
    try {
      await shiftRegistrationService.registerShift(template.id, {
        shiftTemplateId: template.id,
        registrationDate: formatDate(date)
      });
      
      setToast({
        show: true,
        message: `Đăng ký ca ${getShiftTypeLabel(template.shiftType)} thành công!`,
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

  const isRegistered = (templateId: number, date: Date): boolean => {
    const dateStr = formatDate(date);
    return myRegistrations.some(
      reg => reg.shiftId === templateId && 
             reg.registrationDate === dateStr && 
             reg.status === "REGISTERED"
    );
  };

  const getTemplatesForDay = (dayOfWeek: number): ShiftTemplate[] => {
    return templates
      .filter(t => t.dayOfWeek === dayOfWeek)
      .sort((a, b) => getShiftTypeOrder(a.shiftType) - getShiftTypeOrder(b.shiftType));
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
                  const shiftTemplates = templates.filter(t => t.shiftType === shiftType);
                  if (shiftTemplates.length === 0) return null;

                  return (
                    <tr key={shiftType}>
                      <td className="align-middle fw-bold">
                        {getShiftTypeLabel(shiftType)}
                      </td>
                      {weekDays.map(day => {
                        const date = getDateForDay(day);
                        const dayTemplates = getTemplatesForDay(day).filter(t => t.shiftType === shiftType);
                        
                        return (
                          <td key={day} className="text-center align-middle">
                            {dayTemplates.map(template => {
                              const registered = isRegistered(template.id, date);
                              return (
                                <div key={template.id} className="mb-2">
                                  <div className="small mb-1">{template.title}</div>
                                  <div className="small text-muted mb-2">
                                    {template.startTime.substring(0, 5)} - {template.endTime.substring(0, 5)}
                                  </div>
                                  {registered ? (
                                    <span className="badge bg-success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Đã đăng ký
                                    </span>
                                  ) : (
                                    <button
                                      className="btn btn-sm btn-coffee"
                                      onClick={() => handleRegister(template, date)}
                                    >
                                      <i className="bi bi-check-lg me-1"></i>
                                      Đăng ký
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                            {dayTemplates.length === 0 && (
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
