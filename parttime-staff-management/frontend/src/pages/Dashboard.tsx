import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../app/store';
import { fetchStores } from '../features/stores/storeSlice';
import { fetchUsers } from '../features/users/userSlice';
import { fetchPendingCount } from '../features/requests/requestSlice';
import { fetchMyTasks } from '../features/tasks/taskSlice';
import { fetchMyShifts } from '../features/shifts/shiftSlice';
import { fetchAvailableListings, fetchPendingApproval, fetchPendingPeerSwaps } from '../features/marketplace/marketplaceSlice';
import reportService, { SystemReport, StoreReport } from '../api/reportService';
import timeLogService from '../api/timeLogService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { formatCurrency, getCurrentMonth, formatMonth, formatTime } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stores, loading: storesLoading } = useSelector((state: RootState) => state.stores);
  const { users, loading: usersLoading } = useSelector((state: RootState) => state.users);
  const { pendingCount } = useSelector((state: RootState) => state.requests);
  const { myTasks } = useSelector((state: RootState) => state.tasks);
  const { myShifts } = useSelector((state: RootState) => state.shifts);
  const { listings, pendingApproval, pendingPeerSwaps } = useSelector((state: RootState) => state.marketplace);
  
  const [report, setReport] = useState<SystemReport | StoreReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  
  // States for check-in
  const [showCheckInPanel, setShowCheckInPanel] = useState(false);
  const [selectedShiftForCheckIn, setSelectedShiftForCheckIn] = useState<any>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [currentCheckIn, setCurrentCheckIn] = useState<any>(null);
  const [checkedOutShiftIds, setCheckedOutShiftIds] = useState<number[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    dispatch(fetchStores());
    if (user?.role === 'OWNER' || user?.role === 'MANAGER') {
      dispatch(fetchUsers());
      dispatch(fetchPendingCount());
    }
    if (user?.role === 'STAFF') {
      dispatch(fetchMyTasks());
      dispatch(fetchMyShifts());
      dispatch(fetchPendingPeerSwaps());
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
      if (user.storeId) {
        dispatch(fetchAvailableListings(user.storeId));
      }
    }
    if ((user?.role === 'MANAGER' || user?.role === 'OWNER') && user?.storeId) {
      dispatch(fetchPendingApproval(user.storeId));
    }
  }, [dispatch, user?.role, user?.storeId]);

  const loadCurrentCheckIn = async () => {
    try {
      const response = await timeLogService.getCurrentCheckIn();
      setCurrentCheckIn(response.data);
    } catch (error) {
      console.error('Failed to load check-in status:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedShiftForCheckIn) {
      setToast({ show: true, message: 'Vui lòng chọn ca làm!', type: 'warning' });
      return;
    }
    
    setCheckInLoading(true);
    try {
      await timeLogService.checkIn(selectedShiftForCheckIn.id);
      setToast({ show: true, message: `Check-in thành công cho ca "${selectedShiftForCheckIn.title}"!`, type: 'success' });
      // Lưu shift đang check-in để ẩn khỏi danh sách
      if (selectedShiftForCheckIn.id) {
        const checkedInShifts = JSON.parse(localStorage.getItem('checkedInShiftIds') || '[]');
        checkedInShifts.push(selectedShiftForCheckIn.id);
        localStorage.setItem('checkedInShiftIds', JSON.stringify(checkedInShifts));
      }
      loadCurrentCheckIn();
      setShowCheckInPanel(false);
      setSelectedShiftForCheckIn(null);
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
      // Refresh danh sách ca làm
      await dispatch(fetchMyShifts());
      
      // Tự động mở panel chấm công và hiển thị ca tiếp theo sau khi state được cập nhật
      setTimeout(() => {
        // Tính toán lại danh sách ca hôm nay với state mới
        const updatedCheckedOutIds = [...checkedOutShiftIds, checkedOutShiftId];
        const updatedCheckedInIds = JSON.parse(localStorage.getItem('checkedInShiftIds') || '[]');
        
        const updatedTodayShifts = myShifts.filter((shift: any) => {
          const myAssignment = shift.assignments?.find((a: any) => a.userId === user?.id);
          const isConfirmed = myAssignment?.status === 'CONFIRMED';
          const isCheckedOut = updatedCheckedOutIds.includes(shift.id);
          const isCheckedIn = updatedCheckedInIds.includes(shift.id);
          const shiftDate = new Date(shift.startDatetime);
          const today = new Date();
          const isToday = shiftDate.toDateString() === today.toDateString();
          return isConfirmed && !isCheckedOut && !isCheckedIn && isToday;
        });
        
        // Lọc bỏ ca đã quá thời gian check-in
        const updatedAvailableShifts = updatedTodayShifts.filter((shift: any) => !isMissedCheckIn(shift));
        
        if (updatedAvailableShifts.length > 0) {
          setShowCheckInPanel(true);
          // Tự động chọn ca tiếp theo có thể check-in
          const nextShift = updatedAvailableShifts.find((shift: any) => canCheckInShift(shift)) || updatedAvailableShifts[0];
          setSelectedShiftForCheckIn(nextShift);
        } else {
          setShowCheckInPanel(true); // Vẫn mở panel để hiển thị "Không có ca làm"
          setSelectedShiftForCheckIn(null);
        }
      }, 800);
    } catch (error: any) {
      setToast({ show: true, message: error.response?.data?.message || 'Check-out thất bại!', type: 'error' });
    }
    setCheckInLoading(false);
  };

  useEffect(() => {
    loadReport();
  }, [selectedMonth, user]);

  const loadReport = async () => {
    if (!user) return;
    setReportLoading(true);
    try {
      if (user.role === 'OWNER') {
        const response = await reportService.getSystemReport(selectedMonth);
        setReport(response.data);
      } else if (user.role === 'MANAGER' && user.storeId) {
        const response = await reportService.getStoreReport(user.storeId, selectedMonth);
        setReport(response.data);
      }
    } catch (error) {
      console.error('Failed to load report:', error);
    }
    setReportLoading(false);
  };

  const isOwner = user?.role === 'OWNER';
  const isManager = user?.role === 'MANAGER';
  const isStaff = user?.role === 'STAFF';

  // Lấy danh sách ca đang check-in từ localStorage
  const checkedInShiftIds = JSON.parse(localStorage.getItem('checkedInShiftIds') || '[]');
  
  // Kiểm tra ca chưa đến giờ check-in (trước 10 phút so với giờ bắt đầu)
  const isNotYetCheckInTime = (shift: any) => {
    const now = new Date();
    const shiftStart = new Date(shift.startDatetime);
    const allowedFrom = new Date(shiftStart.getTime() - 10 * 60 * 1000); // Trước 10 phút
    return now < allowedFrom;
  };

  // Kiểm tra ca đã quá thời gian hết ca (nghỉ)
  const isMissedCheckIn = (shift: any) => {
    const now = new Date();
    const shiftEnd = new Date(shift.endDatetime);
    // Ca đã quá thời gian hết ca và chưa được check-in
    const isCheckedIn = checkedInShiftIds.includes(shift.id) || currentCheckIn?.shiftId === shift.id;
    const isCheckedOut = checkedOutShiftIds.includes(shift.id);
    return now > shiftEnd && !isCheckedIn && !isCheckedOut;
  };

  // Tính tổng số ca đã xác nhận trong tuần hiện tại (từ đầu tuần đến cuối tuần)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date: Date) => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  };

  const weeklyConfirmedShifts = myShifts.filter((shift: any) => {
    const myAssignment = shift.assignments?.find((a: any) => a.userId === user?.id);
    const isConfirmed = myAssignment?.status === 'CONFIRMED';
    if (!isConfirmed) return false;
    
    // Kiểm tra xem ca có nằm trong tuần hiện tại không
    const shiftDate = new Date(shift.startDatetime);
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);
    return shiftDate >= weekStart && shiftDate <= weekEnd;
  });

  // Lọc ca làm đã xác nhận của nhân viên (chỉ hiển thị ca chưa check-in, chưa bị đánh dấu nghỉ)
  const confirmedShifts = myShifts.filter((shift: any) => {
    const myAssignment = shift.assignments?.find((a: any) => a.userId === user?.id);
    const isConfirmed = myAssignment?.status === 'CONFIRMED';
    const isCheckedOut = checkedOutShiftIds.includes(shift.id);
    const isCheckedIn = checkedInShiftIds.includes(shift.id) || currentCheckIn?.shiftId === shift.id;
    const isMissed = isMissedCheckIn(shift);
    // Hiển thị ca đã xác nhận, chưa check-in, chưa check-out, chưa bị đánh dấu nghỉ
    return isConfirmed && !isCheckedOut && !isCheckedIn && !isMissed;
  });

  // Lọc ca làm hôm nay (đã xác nhận, chưa check-out, chưa check-in) để chấm công
  const todayShifts = myShifts.filter((shift: any) => {
    const myAssignment = shift.assignments?.find((a: any) => a.userId === user?.id);
    const isConfirmed = myAssignment?.status === 'CONFIRMED';
    const isCheckedOut = checkedOutShiftIds.includes(shift.id);
    const isCheckedIn = checkedInShiftIds.includes(shift.id) || currentCheckIn?.shiftId === shift.id;
    const shiftDate = new Date(shift.startDatetime);
    const today = new Date();
    const isToday = shiftDate.toDateString() === today.toDateString();
    return isConfirmed && !isCheckedOut && !isCheckedIn && isToday;
  });

  // Kiểm tra ca có thể check-in không (từ trước 10 phút đến hết giờ làm việc)
  const canCheckInShift = (shift: any) => {
    const now = new Date();
    const shiftStart = new Date(shift.startDatetime);
    const shiftEnd = new Date(shift.endDatetime);
    const allowedFrom = new Date(shiftStart.getTime() - 10 * 60 * 1000);
    return now >= allowedFrom && now <= shiftEnd;
  };

  // Lọc ca làm hôm nay, loại bỏ ca đã quá thời gian check-in
  const availableTodayShifts = todayShifts.filter((shift: any) => !isMissedCheckIn(shift));
  
  // Tự động chọn ca tiếp theo khi mở panel chấm công
  useEffect(() => {
    if (showCheckInPanel && !currentCheckIn && availableTodayShifts.length > 0 && !selectedShiftForCheckIn) {
      // Tìm ca có thể check-in ngay
      const readyShift = availableTodayShifts.find((shift: any) => canCheckInShift(shift));
      if (readyShift) {
        setSelectedShiftForCheckIn(readyShift);
      } else {
        // Nếu không có ca sẵn sàng, chọn ca sắp tới nhất
        const sortedShifts = [...availableTodayShifts].sort((a: any, b: any) => 
          new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime()
        );
        if (sortedShifts.length > 0) {
          setSelectedShiftForCheckIn(sortedShifts[0]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCheckInPanel, currentCheckIn]);

  if (storesLoading || usersLoading) {
    return <Loading />;
  }

  const staffCount = users.filter(u => u.role === 'STAFF').length;
  const activeStaffCount = users.filter(u => u.role === 'STAFF' && u.status === 'ACTIVE').length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Xin chào, {user?.fullName}!</h2>
          <p className="text-muted mb-0">
            {isOwner && 'Tổng quan hệ thống chuỗi cà phê'}
            {isManager && `Quản lý ${user?.storeName}`}
            {isStaff && 'Bảng điều khiển nhân viên'}
          </p>
        </div>
        
        {(isOwner || isManager) && (
          <div>
            <select
              className="form-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value={getCurrentMonth()}>Tháng này</option>
              {/* Add previous months */}
              {Array.from({ length: 5 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - (i + 1));
                const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                return (
                  <option key={month} value={month}>
                    {formatMonth(month)}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Stats Cards - Owner */}
      {isOwner && (
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="stat-card primary">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-value">{stores.length}</div>
                  <div className="stat-label">Cơ sở</div>
                </div>
                <i className="bi bi-shop stat-icon"></i>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="stat-card success">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-value">{activeStaffCount}/{staffCount}</div>
                  <div className="stat-label">Nhân viên</div>
                </div>
                <i className="bi bi-people stat-icon"></i>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="stat-card warning">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-value">{pendingCount}</div>
                  <div className="stat-label">Yêu cầu chờ duyệt</div>
                </div>
                <i className="bi bi-file-earmark-text stat-icon"></i>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="stat-card danger">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-value">
                    {report && 'totalPayroll' in report
                      ? formatCurrency(report.totalPayroll)
                      : '---'}
                  </div>
                  <div className="stat-label">Tổng lương tháng</div>
                </div>
                <i className="bi bi-cash-stack stat-icon"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards - Manager */}
      {isManager && (
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="stat-card primary">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-value">{users.length}</div>
                  <div className="stat-label">Nhân viên</div>
                </div>
                <i className="bi bi-people stat-icon"></i>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="stat-card success">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-value">
                    {report && 'totalShifts' in report ? report.totalShifts : 0}
                  </div>
                  <div className="stat-label">Ca làm việc</div>
                </div>
                <i className="bi bi-calendar3 stat-icon"></i>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="stat-card warning">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-value">{pendingCount}</div>
                  <div className="stat-label">Yêu cầu chờ duyệt</div>
                </div>
                <i className="bi bi-file-earmark-text stat-icon"></i>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="stat-card danger">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-value">
                    {report && 'totalHoursWorked' in report
                      ? `${report.totalHoursWorked}h`
                      : '---'}
                  </div>
                  <div className="stat-label">Tổng giờ làm</div>
                </div>
                <i className="bi bi-clock stat-icon"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions + Chấm công (cho Staff) */}
      <div className="row g-4 mb-4">
        {/* Truy cập nhanh */}
        <div className={isStaff ? "col-lg-6" : "col-12"}>
          <div className="card card-coffee h-100">
            <div className="card-header">
              <i className="bi bi-lightning-fill me-2"></i>
              Truy cập nhanh
            </div>
            <div className="card-body">
              <div className="row g-3">
                {isOwner && (
                  <>
                    <div className="col-6 col-md-4 col-lg-4">
                      <Link to="/stores" className="btn btn-outline-coffee w-100 py-3">
                        <i className="bi bi-shop d-block fs-4 mb-1"></i>
                        Cơ sở
                      </Link>
                    </div>
                    <div className="col-6 col-md-4 col-lg-4">
                      <Link to="/reports" className="btn btn-outline-coffee w-100 py-3">
                        <i className="bi bi-bar-chart-line d-block fs-4 mb-1"></i>
                        Báo cáo
                      </Link>
                    </div>
                  </>
                )}
                {(isOwner || isManager) && (
                  <>
                    <div className="col-6 col-md-4 col-lg-4">
                      <Link to="/users" className="btn btn-outline-coffee w-100 py-3">
                        <i className="bi bi-people d-block fs-4 mb-1"></i>
                        Nhân viên
                      </Link>
                    </div>
                    <div className="col-6 col-md-4 col-lg-4">
                      <Link to="/shifts" className="btn btn-outline-coffee w-100 py-3">
                        <i className="bi bi-calendar3 d-block fs-4 mb-1"></i>
                        Lịch làm
                      </Link>
                    </div>
                    <div className="col-6 col-md-4 col-lg-4">
                      <Link to="/payrolls" className="btn btn-outline-coffee w-100 py-3">
                        <i className="bi bi-cash-stack d-block fs-4 mb-1"></i>
                        Bảng lương
                      </Link>
                    </div>
                  </>
                )}
                <div className="col-6 col-md-4 col-lg-4">
                  <Link to="/requests" className="btn btn-outline-coffee w-100 py-3">
                    <i className="bi bi-file-earmark-text d-block fs-4 mb-1"></i>
                    Yêu cầu
                    {pendingCount > 0 && (
                      <span className="badge bg-danger ms-1">{pendingCount}</span>
                    )}
                  </Link>
                </div>
                {isStaff && (
                  <div className="col-6 col-md-4 col-lg-4">
                    <Link to="/my-shifts" className="btn btn-outline-coffee w-100 py-3">
                      <i className="bi bi-calendar-check d-block fs-4 mb-1"></i>
                      Ca của tôi
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chấm công - Chỉ hiển thị cho Staff */}
        {isStaff && (
          <div className="col-lg-6">
            <div className="card card-coffee h-100">
              <div className="card-header">
                <i className="bi bi-clock-history me-2"></i>
                Chấm công
              </div>
              <div className="card-body">
                {/* Nếu đang trong ca làm */}
                {currentCheckIn ? (
                  <div className="text-center">
                    <div className="alert alert-success mb-3">
                      <i className="bi bi-check-circle me-2"></i>
                      Đang trong ca làm
                      {currentCheckIn.shiftTitle && (
                        <strong className="d-block mt-1">{currentCheckIn.shiftTitle}</strong>
                      )}
                      <small className="d-block mt-1">
                        Check-in lúc: {new Date(currentCheckIn.checkIn).toLocaleTimeString('vi-VN')}
                      </small>
                    </div>
                    <button
                      className="btn btn-danger btn-lg w-100"
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
                  </div>
                ) : (
                  <>
                    {/* Nút Chấm công */}
                    {!showCheckInPanel ? (
                      <div className="text-center">
                        <button
                          className="btn btn-success btn-lg w-100 py-4"
                          onClick={() => setShowCheckInPanel(true)}
                        >
                          <i className="bi bi-clock d-block fs-1 mb-2"></i>
                          Chấm công
                        </button>
                        <small className="text-muted mt-2 d-block">
                          Nhấn để xem ca làm hôm nay
                        </small>
                      </div>
                    ) : (
                      <>
                        {/* Panel chọn ca làm */}
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            <i className="bi bi-calendar-day me-2"></i>
                            Ca làm hôm nay ({new Date().toLocaleDateString('vi-VN')})
                          </label>
                          
                          {availableTodayShifts.length === 0 ? (
                            <div className="alert alert-info mb-0">
                              <i className="bi bi-info-circle me-2"></i>
                              Không có ca làm
                            </div>
                          ) : (
                            <div className="list-group">
                              {availableTodayShifts.map((shift: any) => {
                                const canCheckIn = canCheckInShift(shift);
                                return (
                                  <label
                                    key={shift.id}
                                    className={`list-group-item list-group-item-action d-flex align-items-center ${
                                      selectedShiftForCheckIn?.id === shift.id ? 'active' : ''
                                    } ${!canCheckIn ? 'disabled opacity-50' : ''}`}
                                    style={{ cursor: canCheckIn ? 'pointer' : 'not-allowed' }}
                                  >
                                    <input
                                      type="radio"
                                      name="shiftSelect"
                                      className="form-check-input me-3"
                                      checked={selectedShiftForCheckIn?.id === shift.id}
                                      onChange={() => canCheckIn && setSelectedShiftForCheckIn(shift)}
                                      disabled={!canCheckIn}
                                    />
                                    <div className="flex-grow-1">
                                      <strong>{shift.title}</strong>
                                      <br />
                                      <small>
                                        <i className="bi bi-clock me-1"></i>
                                        {formatTime(shift.startDatetime)} - {formatTime(shift.endDatetime)}
                                      </small>
                                      {!canCheckIn && (
                                        <small className="d-block text-danger">
                                          Chưa đến giờ check-in
                                        </small>
                                      )}
                                      {canCheckIn && (
                                        <small className="d-block text-success">
                                          <i className="bi bi-check-circle me-1"></i>
                                          Sẵn sàng check-in
                                        </small>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Nút xác nhận và hủy */}
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-secondary flex-grow-1"
                            onClick={() => {
                              setShowCheckInPanel(false);
                              setSelectedShiftForCheckIn(null);
                            }}
                          >
                            Hủy
                          </button>
                          <button
                            className="btn btn-success flex-grow-1"
                            onClick={handleCheckIn}
                            disabled={!selectedShiftForCheckIn || checkInLoading}
                          >
                            {checkInLoading ? (
                              <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : (
                              <i className="bi bi-check-lg me-2"></i>
                            )}
                            Xác nhận Check-in
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Store Overview for Owner */}
      {isOwner && report && 'storeReports' in report && (
        <div className="card card-coffee">
          <div className="card-header">
            <i className="bi bi-shop me-2"></i>
            Tổng quan theo cơ sở - {formatMonth(selectedMonth)}
          </div>
          <div className="card-body p-0">
            {reportLoading ? (
              <Loading />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Cơ sở</th>
                      <th className="text-center">Nhân viên</th>
                      <th className="text-center">Ca làm</th>
                      <th className="text-center">Giờ làm</th>
                      <th className="text-end">Tổng lương</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.storeReports.map((store) => (
                      <tr key={store.storeId}>
                        <td>
                          <strong>{store.storeName}</strong>
                        </td>
                        <td className="text-center">{store.totalStaff}</td>
                        <td className="text-center">{store.totalShifts}</td>
                        <td className="text-center">{store.totalHoursWorked}h</td>
                        <td className="text-end">{formatCurrency(store.totalPayroll)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th>Tổng cộng</th>
                      <th className="text-center">{report.totalStaff}</th>
                      <th className="text-center">{report.totalShifts}</th>
                      <th className="text-center">{report.totalHoursWorked}h</th>
                      <th className="text-end">{formatCurrency(report.totalPayroll)}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Staff Dashboard */}
      {isStaff && (
        <>
          {/* Staff Stats */}
          <div className="row g-4 mb-4">
            <div className="col-6 col-lg-3">
              <div className="stat-card primary">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="stat-value">{weeklyConfirmedShifts.length}</div>
                    <div className="stat-label">Ca tuần này</div>
                  </div>
                  <i className="bi bi-calendar-check stat-icon"></i>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="stat-card success">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="stat-value">{myTasks.filter(t => t.status !== 'COMPLETED').length}</div>
                    <div className="stat-label">Nhiệm vụ</div>
                  </div>
                  <i className="bi bi-list-check stat-icon"></i>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="stat-card warning">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="stat-value">{listings.filter(l => l.status === 'PENDING').length}</div>
                    <div className="stat-label">Ca đang nhường</div>
                  </div>
                  <i className="bi bi-shop-window stat-icon"></i>
                </div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="stat-card danger">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="stat-value">{pendingPeerSwaps.length}</div>
                    <div className="stat-label">Đổi ca chờ</div>
                  </div>
                  <i className="bi bi-arrow-left-right stat-icon"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Upcoming Shifts */}
            <div className="col-lg-6">
              <div className="card card-coffee h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span>
                    <i className="bi bi-calendar-week me-2"></i>
                    Ca làm sắp tới
                  </span>
                  <Link to="/my-shifts" className="btn btn-sm btn-light">Xem tất cả</Link>
                </div>
                <div className="card-body p-0">
                  {confirmedShifts.slice(0, 4).map((shift) => (
                    <div key={shift.id} className="d-flex align-items-center p-3 border-bottom">
                      <div className="me-3">
                        <div className="bg-coffee-light rounded p-2 text-white text-center" style={{width: '50px'}}>
                          <small className="d-block">{new Date(shift.startDatetime).toLocaleDateString('vi-VN', { weekday: 'short' })}</small>
                          <strong>{new Date(shift.startDatetime).getDate()}</strong>
                        </div>
                      </div>
                      <div>
                        <strong>{shift.title}</strong>
                        <br />
                        <small className="text-muted">
                          {formatTime(shift.startDatetime)} - {formatTime(shift.endDatetime)}
                        </small>
                      </div>
                    </div>
                  ))}
                  {confirmedShifts.length === 0 && (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-calendar-x d-block fs-2 mb-2"></i>
                      Chưa có ca làm
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tasks & Quick Actions */}
            <div className="col-lg-6">
              <div className="card card-coffee h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span>
                    <i className="bi bi-list-check me-2"></i>
                    Nhiệm vụ cần làm
                  </span>
                  <Link to="/tasks" className="btn btn-sm btn-light">Xem tất cả</Link>
                </div>
                <div className="card-body p-0">
                  {myTasks.filter(t => t.status !== 'COMPLETED').slice(0, 4).map((task) => (
                    <div key={task.id} className="d-flex align-items-center p-3 border-bottom">
                      <div className={`badge me-3 ${task.priority === 'URGENT' ? 'bg-danger' : task.priority === 'HIGH' ? 'bg-warning' : 'bg-secondary'}`}>
                        {task.priority === 'URGENT' ? '!' : task.priority === 'HIGH' ? '!!' : '...'}
                      </div>
                      <div className="flex-grow-1">
                        <strong>{task.title}</strong>
                        {task.dueDate && (
                          <small className={`d-block ${task.isOverdue ? 'text-danger' : 'text-muted'}`}>
                            Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                          </small>
                        )}
                      </div>
                    </div>
                  ))}
                  {myTasks.filter(t => t.status !== 'COMPLETED').length === 0 && (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-check-circle d-block fs-2 mb-2"></i>
                      Không có nhiệm vụ
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Marketplace */}
            {listings.filter(l => l.status === 'PENDING').length > 0 && (
              <div className="col-12">
                <div className="card card-coffee">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <span>
                      <i className="bi bi-shop-window me-2"></i>
                      Chợ Ca - Ca đang được nhường
                    </span>
                    <Link to="/marketplace" className="btn btn-sm btn-light">Xem Chợ Ca</Link>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {listings.filter(l => l.status === 'PENDING').slice(0, 3).map((listing) => (
                        <div key={listing.id} className="col-md-4">
                          <div className="border rounded p-3">
                            <strong>{listing.shiftTitle}</strong>
                            <p className="small text-muted mb-1">
                              {new Date(listing.shiftStart).toLocaleDateString('vi-VN')} - {formatTime(listing.shiftStart)}
                            </p>
                            <p className="small mb-0">
                              <i className="bi bi-person me-1"></i>
                              {listing.fromUserName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Info */}
            <div className="col-md-6">
              <div className="card card-coffee h-100">
                <div className="card-header">
                  <i className="bi bi-person-badge me-2"></i>
                  Thông tin cá nhân
                </div>
                <div className="card-body">
                  <table className="table table-borderless mb-0">
                    <tbody>
                      <tr>
                        <td className="text-muted" width="40%">Họ tên:</td>
                        <td><strong>{user?.fullName}</strong></td>
                      </tr>
                      <tr>
                        <td className="text-muted">Email:</td>
                        <td>{user?.email}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Cơ sở:</td>
                        <td>{user?.storeName}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Lương/giờ:</td>
                        <td>{user?.hourlyRate ? formatCurrency(user.hourlyRate) : '---'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Hành động nhanh */}
            <div className="col-md-6">
              <div className="card card-coffee h-100">
                <div className="card-header">
                  <i className="bi bi-lightning me-2"></i>
                  Hành động nhanh
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <Link to="/my-shifts" className="btn btn-coffee">
                      <i className="bi bi-calendar3 me-2"></i>
                      Xem lịch làm việc
                    </Link>
                    <Link to="/marketplace" className="btn btn-outline-coffee">
                      <i className="bi bi-shop-window me-2"></i>
                      Đến Chợ Ca
                    </Link>
                    <Link to="/requests" className="btn btn-outline-coffee">
                      <i className="bi bi-plus-circle me-2"></i>
                      Gửi yêu cầu nghỉ/đổi ca
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
};

export default Dashboard;





