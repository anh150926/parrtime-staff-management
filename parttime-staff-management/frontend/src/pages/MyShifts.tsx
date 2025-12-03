import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchMyShifts, updateShiftAssignment } from '../features/shifts/shiftSlice';
import timeLogService from '../api/timeLogService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { formatDateTime, formatTime } from '../utils/formatters';

const MyShifts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { myShifts, loading } = useSelector((state: RootState) => state.shifts);
  
  const [currentCheckIn, setCurrentCheckIn] = useState<any>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkedOutShiftIds, setCheckedOutShiftIds] = useState<number[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ show: false, message: '', type: 'success' });

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
  }, [dispatch]);

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
    
    // Cho phép check-in trước 10 phút và sau 5 phút so với giờ bắt đầu ca
    const checkInAllowedFrom = new Date(shiftStart.getTime() - 10 * 60 * 1000); // Trước 10 phút
    const checkInAllowedUntil = new Date(shiftStart.getTime() + 5 * 60 * 1000);  // Sau 5 phút
    
    return now >= checkInAllowedFrom && now <= checkInAllowedUntil;
  };

  // Kiểm tra ca đã quá thời gian check-in (sau 5 phút so với giờ bắt đầu)
  const isMissedCheckIn = (shift: any) => {
    const assignment = getMyAssignment(shift);
    if (assignment?.status !== 'CONFIRMED') return false;
    
    const now = new Date();
    const shiftStart = new Date(shift.startDatetime);
    const checkInDeadline = new Date(shiftStart.getTime() + 5 * 60 * 1000); // Sau 5 phút
    
    // Ca đã quá thời gian check-in và chưa được check-in
    const isCheckedIn = checkedInShiftIds.includes(shift.id) || currentCheckIn?.shiftId === shift.id;
    const isCheckedOut = checkedOutShiftIds.includes(shift.id);
    
    return now > checkInDeadline && !isCheckedIn && !isCheckedOut;
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-calendar-check me-2"></i>
            Ca làm của tôi
          </h2>
          <p className="text-muted mb-0">Xem và quản lý ca làm việc</p>
        </div>
      </div>

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

      {/* Danh sách ca làm */}
      <div className="row g-3">
        {filteredShifts.map((shift: any) => {
          const assignment = getMyAssignment(shift);
          const isActive = isCheckedInThisShift(shift);
          const isCheckedOut = checkedOutShiftIds.includes(shift.id);
          const isCheckedIn = checkedInShiftIds.includes(shift.id) || currentCheckIn?.shiftId === shift.id;
          const missedCheckIn = isMissedCheckIn(shift);
          const checkInAvailable = canCheckIn(shift) && !currentCheckIn && !isCheckedOut && !isCheckedIn && !missedCheckIn;
          
          // Ẩn ca đang active (đã hiển thị ở trên)
          if (isActive) return null;
          
          return (
            <div key={shift.id} className="col-md-6 col-lg-4">
              <div 
                className={`shift-card ${assignment?.status === 'CONFIRMED' ? 'confirmed' : 'pending'} ${checkInAvailable ? 'cursor-pointer' : ''} ${isCheckedOut ? 'opacity-75' : ''} ${isCheckedIn ? 'border-warning' : ''} ${missedCheckIn ? 'opacity-75' : ''}`}
                onClick={() => checkInAvailable ? handleOpenCheckInModal(shift) : null}
                style={{ cursor: checkInAvailable ? 'pointer' : 'default' }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-0">{shift.title}</h5>
                  {checkInAvailable && (
                    <span className="badge bg-success">
                      <i className="bi bi-clock me-1"></i>
                      Sẵn sàng
                    </span>
                  )}
                  {isCheckedIn && !isCheckedOut && (
                    <span className="badge bg-warning text-dark">
                      <i className="bi bi-hourglass-split me-1"></i>
                      Đang làm
                    </span>
                  )}
                  {missedCheckIn && (
                    <span className="badge bg-danger">
                      <i className="bi bi-x-circle me-1"></i>
                      Nghỉ
                    </span>
                  )}
                  {isCheckedOut && (
                    <span className="badge bg-secondary">
                      <i className="bi bi-check-circle me-1"></i>
                      Đã hoàn thành
                    </span>
                  )}
                </div>
                
                <p className="mb-1 small">
                  <i className="bi bi-shop me-2"></i>
                  {shift.storeName}
                </p>
                <p className="mb-1 small text-muted">
                  <i className="bi bi-calendar me-2"></i>
                  {formatDateTime(shift.startDatetime)}
                </p>
                <p className="mb-3 small text-muted">
                  <i className="bi bi-clock me-2"></i>
                  {formatTime(shift.startDatetime)} - {formatTime(shift.endDatetime)}
                </p>

                {assignment && (
                  <div>
                    {assignment.status === 'ASSIGNED' && !isCheckedOut && !isCheckedIn && !missedCheckIn && (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-success flex-grow-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmShift(shift.id, 'CONFIRMED');
                          }}
                        >
                          <i className="bi bi-check me-1"></i>
                          Xác nhận
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger flex-grow-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmShift(shift.id, 'DECLINED');
                          }}
                        >
                          <i className="bi bi-x me-1"></i>
                          Từ chối
                        </button>
                      </div>
                    )}
                    {assignment.status === 'CONFIRMED' && !checkInAvailable && !isCheckedOut && !isCheckedIn && !missedCheckIn && (
                      <span className="badge bg-success w-100 py-2">
                        <i className="bi bi-check-circle me-1"></i>
                        Đã xác nhận
                      </span>
                    )}
                    {assignment.status === 'CONFIRMED' && checkInAvailable && (
                      <button 
                        className="btn btn-success w-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCheckInModal(shift);
                        }}
                      >
                        <i className="bi bi-box-arrow-in-right me-1"></i>
                        Nhấn để Check-in
                      </button>
                    )}
                    {missedCheckIn && (
                      <span className="badge bg-danger w-100 py-2">
                        <i className="bi bi-x-circle me-1"></i>
                        Nghỉ
                      </span>
                    )}
                    {isCheckedIn && !isCheckedOut && (
                      <span className="badge bg-warning text-dark w-100 py-2">
                        <i className="bi bi-hourglass-split me-1"></i>
                        Đang làm
                      </span>
                    )}
                    {isCheckedOut && (
                      <span className="badge bg-secondary w-100 py-2">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Đã hoàn thành
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredShifts.length === 0 && !currentCheckIn && (
          <div className="col-12">
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar-x fs-1 d-block mb-3"></i>
              <p>Bạn chưa được phân công ca làm nào</p>
            </div>
          </div>
        )}
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
