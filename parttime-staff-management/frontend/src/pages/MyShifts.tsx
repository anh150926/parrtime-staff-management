import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchMyShifts, updateShiftAssignment } from '../features/shifts/shiftSlice';
import timeLogService from '../api/timeLogService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { formatDateTime, formatTime } from '../utils/formatters';

interface MyShiftsProps {
  hideHeader?: boolean;
}

const MyShifts: React.FC<MyShiftsProps> = ({ hideHeader = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { myShifts, loading } = useSelector((state: RootState) => state.shifts);
  
  const [currentCheckIn, setCurrentCheckIn] = useState<any>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkedOutShiftIds, setCheckedOutShiftIds] = useState<number[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ show: false, message: '', type: 'success' });

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

  useEffect(() => {
    dispatch(fetchMyShifts());
    loadCurrentCheckIn();
    // Load checked-out shifts từ localStorage
    const savedCheckedOut = localStorage.getItem('checkedOutShiftIds');
    if (savedCheckedOut) {
      try {
        const ids = JSON.parse(savedCheckedOut);
        setCheckedOutShiftIds(ids);
      } catch (e) {
        console.error('Failed to parse checked-out shifts:', e);
      }
    }
  }, [dispatch, weekStart]);

  const loadCurrentCheckIn = async () => {
    try {
      const response = await timeLogService.getCurrentCheckIn();
      setCurrentCheckIn(response.data);
    } catch (error) {
      console.error('Failed to load check-in status:', error);
    }
  };

  const handleOpenCheckInModal = (shift: any) => {
    setSelectedShift(shift);
    setShowCheckInModal(true);
  };

  const handleCheckIn = async () => {
    if (!selectedShift) return;
    
    setCheckInLoading(true);
    try {
      await timeLogService.checkIn(selectedShift.id);
      setToast({ show: true, message: `Check-in thành công cho ca "${selectedShift.title}"!`, type: 'success' });
      // Lưu shift đang check-in để ẩn khỏi danh sách
      if (selectedShift.id) {
        const checkedInShifts = JSON.parse(localStorage.getItem('checkedInShiftIds') || '[]');
        checkedInShifts.push(selectedShift.id);
        localStorage.setItem('checkedInShiftIds', JSON.stringify(checkedInShifts));
      }
      loadCurrentCheckIn();
      setShowCheckInModal(false);
      setSelectedShift(null);
      // Refresh danh sách ca làm
      dispatch(fetchMyShifts());
    } catch (error: any) {
      setToast({ show: true, message: error.response?.data?.message || 'Check-in thất bại!', type: 'error' });
    }
    setCheckInLoading(false);
  };

  const handleCheckOut = async () => {
    setCheckInLoading(true);
    const checkedOutShiftId = currentCheckIn?.shiftId; // Lưu shiftId trước khi set null
    try {
      const response = await timeLogService.checkOut();
      const duration = response.data.durationFormatted || '';
      setToast({ show: true, message: `Check-out thành công! Thời gian làm: ${duration}`, type: 'success' });
      // Lưu shift đã check-out vào state và localStorage
      if (checkedOutShiftId) {
        setCheckedOutShiftIds(prev => {
          const newIds = [...prev, checkedOutShiftId];
          localStorage.setItem('checkedOutShiftIds', JSON.stringify(newIds));
          return newIds;
        });
        // Xóa khỏi danh sách đang check-in
        const checkedInShifts = JSON.parse(localStorage.getItem('checkedInShiftIds') || '[]');
        const updatedCheckedIn = checkedInShifts.filter((id: number) => id !== checkedOutShiftId);
        localStorage.setItem('checkedInShiftIds', JSON.stringify(updatedCheckedIn));
      }
      setCurrentCheckIn(null);
      setShowCheckInModal(false);
      setSelectedShift(null);
      // Refresh danh sách ca làm
      dispatch(fetchMyShifts());
    } catch (error: any) {
      setToast({ show: true, message: error.response?.data?.message || 'Check-out thất bại!', type: 'error' });
    }
    setCheckInLoading(false);
  };

  const handleConfirmShift = async (shiftId: number, status: 'CONFIRMED' | 'DECLINED') => {
    try {
      await dispatch(updateShiftAssignment({ shiftId, status })).unwrap();
      setToast({ show: true, message: status === 'CONFIRMED' ? 'Đã xác nhận ca!' : 'Đã từ chối ca!', type: 'success' });
      dispatch(fetchMyShifts());
    } catch (error: any) {
      setToast({ show: true, message: error || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const getMyAssignment = (shift: any) => {
    return shift.assignments?.find((a: any) => a.userId === user?.id);
  };

  // Kiểm tra ca có thể check-in không (đã xác nhận và trong khoảng thời gian cho phép)
  const canCheckIn = (shift: any) => {
    const assignment = getMyAssignment(shift);
    if (assignment?.status !== 'CONFIRMED') return false;
    
    const now = new Date();
    const shiftStart = new Date(shift.startDatetime);
    const shiftEnd = new Date(shift.endDatetime);
    
    // Cho phép check-in từ trước 10 phút đến hết giờ làm việc của ca
    const checkInAllowedFrom = new Date(shiftStart.getTime() - 10 * 60 * 1000); // Trước 10 phút
    
    return now >= checkInAllowedFrom && now <= shiftEnd;
  };

  // Kiểm tra ca đã quá thời gian hết ca (nghỉ)
  const isMissedCheckIn = (shift: any) => {
    const assignment = getMyAssignment(shift);
    if (assignment?.status !== 'CONFIRMED') return false;
    
    const now = new Date();
    const shiftEnd = new Date(shift.endDatetime);
    
    // Ca đã quá thời gian hết ca và chưa được check-in
    const isCheckedIn = checkedInShiftIds.includes(shift.id) || currentCheckIn?.shiftId === shift.id;
    const isCheckedOut = checkedOutShiftIds.includes(shift.id);
    
    return now > shiftEnd && !isCheckedIn && !isCheckedOut;
  };

  // Kiểm tra ca đã check-in nhưng đi muộn (sau 5 phút nhưng trước hết ca)
  const isLateCheckIn = (shift: any) => {
    if (!currentCheckIn || currentCheckIn.shiftId !== shift.id) return false;
    
    const shiftStart = new Date(shift.startDatetime);
    const checkInTime = new Date(currentCheckIn.checkIn);
    const lateThreshold = new Date(shiftStart.getTime() + 5 * 60 * 1000); // Sau 5 phút
    
    return checkInTime > lateThreshold;
  };

  // Kiểm tra đang check-in ca này không
  const isCheckedInThisShift = (shift: any) => {
    return currentCheckIn && currentCheckIn.shiftId === shift.id;
  };

  if (loading) return <Loading />;

  // Tách ca đang check-in ra riêng
  const activeShift = myShifts.find((s: any) => isCheckedInThisShift(s));

  // Load checked-in shifts từ localStorage
  const checkedInShiftIds = JSON.parse(localStorage.getItem('checkedInShiftIds') || '[]');
  
  // Lọc bỏ các ca đã từ chối (nhưng giữ lại ca đã check-out để hiển thị "Đã hoàn thành")
  const filteredShifts = myShifts.filter((shift: any) => {
    const assignment = getMyAssignment(shift);
    return assignment?.status !== 'DECLINED';
  });

  // Helper functions for weekly timetable
  const getDateForDay = (dayOfWeek: number): Date => {
    const date = new Date(weekStart);
    const diff = dayOfWeek - 1; // dayOfWeek is 1-7, we need 0-6
    date.setDate(date.getDate() + diff);
    return date;
  };

  const getShiftsForDay = (dayOfWeek: number): any[] => {
    const date = getDateForDay(dayOfWeek);
    const dateStr = formatDate(date);
    
    return filteredShifts.filter((shift: any) => {
      const shiftDate = new Date(shift.startDatetime);
      const shiftDateStr = formatDate(shiftDate);
      return shiftDateStr === dateStr;
    }).sort((a: any, b: any) => {
      const timeA = new Date(a.startDatetime).getTime();
      const timeB = new Date(b.startDatetime).getTime();
      return timeA - timeB;
    });
  };

  const getShiftTypeFromTime = (startTime: string): string => {
    const hour = new Date(startTime).getHours();
    if (hour < 12) return 'MORNING';
    if (hour < 18) return 'AFTERNOON';
    return 'EVENING';
  };

  const weekDays = [1, 2, 3, 4, 5, 6, 7]; // Monday to Sunday

  return (
    <div>
      {!hideHeader && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">
              <i className="bi bi-calendar-check me-2"></i>
              Lịch làm việc
            </h2>
            <p className="text-muted mb-0">Xem và quản lý ca làm việc</p>
          </div>
        </div>
      )}

      {/* Hiển thị ca đang check-in (nếu có) */}
      {currentCheckIn && activeShift && (
        <div className="card border-success mb-4" style={{ borderWidth: '2px' }}>
          <div className="card-header bg-success text-white">
            <i className="bi bi-clock-fill me-2"></i>
            Đang trong ca làm việc
          </div>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h5 className="mb-1">{activeShift.title}</h5>
                <p className="mb-1 text-muted">
                  <i className="bi bi-shop me-2"></i>{activeShift.storeName}
                </p>
                <p className="mb-1 text-muted">
                  <i className="bi bi-clock me-2"></i>
                  {formatTime(activeShift.startDatetime)} - {formatTime(activeShift.endDatetime)}
                </p>
                <p className="mb-0 text-success">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Check-in lúc: {formatDateTime(currentCheckIn.checkIn)}
                </p>
              </div>
              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                <button
                  className="btn btn-danger btn-lg"
                  onClick={() => {
                    setSelectedShift(activeShift);
                    handleCheckOut();
                  }}
                  disabled={checkInLoading}
                >
                  {checkInLoading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-box-arrow-right me-2"></i>
                  )}
                  Check-out
                </button>
              </div>
            </div>
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
                        const date = getDateForDay(day);
                        const dayShifts = getShiftsForDay(day).filter((shift: any) => {
                          return getShiftTypeFromTime(shift.startDatetime) === shiftType;
                        });
                        
                        return (
                          <td key={day} className="text-center align-middle" style={{ verticalAlign: 'top' }}>
                            {dayShifts.map((shift: any) => {
                              const assignment = getMyAssignment(shift);
                              const isActive = isCheckedInThisShift(shift);
                              const isCheckedOut = checkedOutShiftIds.includes(shift.id);
                              const isCheckedIn = checkedInShiftIds.includes(shift.id) || currentCheckIn?.shiftId === shift.id;
                              const missedCheckIn = isMissedCheckIn(shift);
                              const checkInAvailable = canCheckIn(shift) && !currentCheckIn && !isCheckedOut && !isCheckedIn && !missedCheckIn;
                              
                              // Skip active shift (shown at top)
                              if (isActive) return null;

                              let statusBadge = null;
                              let statusClass = '';
                              
                              if (assignment?.status === 'ASSIGNED') {
                                statusBadge = <span className="badge bg-warning">Chờ xác nhận</span>;
                                statusClass = 'pending';
                              } else if (assignment?.status === 'CONFIRMED') {
                                if (checkInAvailable) {
                                  statusBadge = <span className="badge bg-success">Sẵn sàng</span>;
                                  statusClass = 'available';
                                } else if (isCheckedIn) {
                                  statusBadge = <span className="badge bg-info">Đang làm</span>;
                                  statusClass = 'working';
                                } else if (missedCheckIn) {
                                  statusBadge = <span className="badge bg-danger">Nghỉ</span>;
                                  statusClass = 'missed';
                                } else {
                                  statusBadge = <span className="badge bg-success">Đã xác nhận</span>;
                                  statusClass = 'confirmed';
                                }
                              } else if (isCheckedOut) {
                                statusBadge = <span className="badge bg-secondary">Hoàn thành</span>;
                                statusClass = 'completed';
                              }

                              return (
                                <div 
                                  key={shift.id} 
                                  className={`mb-2 p-2 border rounded ${statusClass} ${checkInAvailable ? 'cursor-pointer' : ''}`}
                                  style={{ 
                                    cursor: checkInAvailable ? 'pointer' : 'default',
                                    backgroundColor: statusClass === 'available' ? '#d4edda' : statusClass === 'working' ? '#d1ecf1' : statusClass === 'missed' ? '#f8d7da' : statusClass === 'completed' ? '#e2e3e5' : '#fff3cd'
                                  }}
                                  onClick={() => checkInAvailable ? handleOpenCheckInModal(shift) : null}
                                >
                                  <div className="small fw-bold mb-1">{shift.title}</div>
                                  <div className="small text-muted mb-1">
                                    {formatTime(shift.startDatetime)} - {formatTime(shift.endDatetime)}
                                  </div>
                                  <div className="mb-1">{statusBadge}</div>
                                  {assignment?.status === 'ASSIGNED' && !isCheckedOut && !isCheckedIn && !missedCheckIn && (
                                    <div className="d-flex gap-1 mt-1">
                                      <button
                                        className="btn btn-sm btn-success flex-grow-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleConfirmShift(shift.id, 'CONFIRMED');
                                        }}
                                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                                      >
                                        <i className="bi bi-check"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-danger flex-grow-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleConfirmShift(shift.id, 'DECLINED');
                                        }}
                                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                                      >
                                        <i className="bi bi-x"></i>
                                      </button>
                                    </div>
                                  )}
                                  {assignment?.status === 'CONFIRMED' && checkInAvailable && (
                                    <button 
                                      className="btn btn-sm btn-success w-100 mt-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenCheckInModal(shift);
                                      }}
                                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                                    >
                                      Check-in
                                    </button>
                                  )}
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

      {/* Modal Check-in */}
      {showCheckInModal && selectedShift && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content modal-coffee">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-clock me-2"></i>
                    Check-in ca làm
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      setShowCheckInModal(false);
                      setSelectedShift(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="text-center mb-4">
                    <i className="bi bi-calendar-check fs-1 text-success"></i>
                  </div>
                  
                  <div className="card bg-light mb-3">
                    <div className="card-body">
                      <h5 className="card-title">{selectedShift.title}</h5>
                      <p className="mb-1">
                        <i className="bi bi-shop me-2"></i>
                        {selectedShift.storeName}
                      </p>
                      <p className="mb-1">
                        <i className="bi bi-calendar me-2"></i>
                        {formatDateTime(selectedShift.startDatetime)}
                      </p>
                      <p className="mb-0">
                        <i className="bi bi-clock me-2"></i>
                        {formatTime(selectedShift.startDatetime)} - {formatTime(selectedShift.endDatetime)}
                      </p>
                    </div>
                  </div>

                  <p className="text-center text-muted">
                    Bạn có muốn check-in cho ca làm này không?
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCheckInModal(false);
                      setSelectedShift(null);
                    }}
                    disabled={checkInLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleCheckIn}
                    disabled={checkInLoading}
                  >
                    {checkInLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Check-in ngay
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
};

export default MyShifts;
