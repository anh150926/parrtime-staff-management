import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchMyShifts, updateShiftAssignment } from '../features/shifts/shiftSlice';
import timeLogService from '../api/timeLogService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { formatDateTime, formatTime, formatDuration } from '../utils/formatters';

const MyShifts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { myShifts, loading } = useSelector((state: RootState) => state.shifts);
  
  const [currentCheckIn, setCurrentCheckIn] = useState<any>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    dispatch(fetchMyShifts());
    loadCurrentCheckIn();
  }, [dispatch]);

  const loadCurrentCheckIn = async () => {
    try {
      const response = await timeLogService.getCurrentCheckIn();
      setCurrentCheckIn(response.data);
    } catch (error) {
      console.error('Failed to load check-in status:', error);
    }
  };

  const handleCheckIn = async (shiftId?: number) => {
    setCheckInLoading(true);
    try {
      await timeLogService.checkIn(shiftId);
      setToast({ show: true, message: 'Check-in thành công!', type: 'success' });
      loadCurrentCheckIn();
    } catch (error: any) {
      setToast({ show: true, message: error.response?.data?.message || 'Check-in thất bại!', type: 'error' });
    }
    setCheckInLoading(false);
  };

  const handleCheckOut = async () => {
    setCheckInLoading(true);
    try {
      const response = await timeLogService.checkOut();
      const duration = response.data.durationFormatted || '';
      setToast({ show: true, message: `Check-out thành công! Thời gian làm: ${duration}`, type: 'success' });
      setCurrentCheckIn(null);
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

  if (loading) return <Loading />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Ca làm của tôi</h2>
          <p className="text-muted mb-0">Xem và quản lý ca làm việc</p>
        </div>
      </div>

      {/* Check-in/Check-out Card */}
      <div className="card card-coffee mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              {currentCheckIn ? (
                <div>
                  <h5 className="text-success mb-1">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Đang trong ca làm
                  </h5>
                  <p className="mb-0 text-muted">
                    Bắt đầu: {formatDateTime(currentCheckIn.checkIn)}
                  </p>
                </div>
              ) : (
                <div>
                  <h5 className="mb-1">Chưa check-in</h5>
                  <p className="mb-0 text-muted">
                    Nhấn nút Check-in để bắt đầu ca làm việc
                  </p>
                </div>
              )}
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              {currentCheckIn ? (
                <button
                  className="btn btn-danger btn-lg"
                  onClick={handleCheckOut}
                  disabled={checkInLoading}
                >
                  {checkInLoading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-box-arrow-right me-2"></i>
                  )}
                  Check-out
                </button>
              ) : (
                <button
                  className="btn btn-success btn-lg"
                  onClick={() => handleCheckIn()}
                  disabled={checkInLoading}
                >
                  {checkInLoading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                  )}
                  Check-in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shifts List */}
      <div className="row g-3">
        {myShifts.map((shift) => {
          const assignment = getMyAssignment(shift);
          return (
            <div key={shift.id} className="col-md-6 col-lg-4">
              <div className={`shift-card ${assignment?.status === 'CONFIRMED' ? 'confirmed' : 'pending'}`}>
                <h5 className="mb-2">{shift.title}</h5>
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
                  <div className="d-flex gap-2">
                    {assignment.status === 'ASSIGNED' && (
                      <>
                        <button
                          className="btn btn-sm btn-success flex-grow-1"
                          onClick={() => handleConfirmShift(shift.id, 'CONFIRMED')}
                        >
                          <i className="bi bi-check me-1"></i>
                          Xác nhận
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger flex-grow-1"
                          onClick={() => handleConfirmShift(shift.id, 'DECLINED')}
                        >
                          <i className="bi bi-x me-1"></i>
                          Từ chối
                        </button>
                      </>
                    )}
                    {assignment.status === 'CONFIRMED' && (
                      <span className="badge bg-success w-100 py-2">
                        <i className="bi bi-check-circle me-1"></i>
                        Đã xác nhận
                      </span>
                    )}
                    {assignment.status === 'DECLINED' && (
                      <span className="badge bg-danger w-100 py-2">
                        <i className="bi bi-x-circle me-1"></i>
                        Đã từ chối
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {myShifts.length === 0 && (
          <div className="col-12">
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar-x fs-1 d-block mb-3"></i>
              <p>Bạn chưa được phân công ca làm nào</p>
            </div>
          </div>
        )}
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
};

export default MyShifts;

