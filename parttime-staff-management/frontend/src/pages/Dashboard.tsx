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
import Loading from '../components/Loading';
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
      if (user.storeId) {
        dispatch(fetchAvailableListings(user.storeId));
      }
    }
    if ((user?.role === 'MANAGER' || user?.role === 'OWNER') && user?.storeId) {
      dispatch(fetchPendingApproval(user.storeId));
    }
  }, [dispatch, user?.role, user?.storeId]);

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

      {/* Quick Actions */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card card-coffee">
            <div className="card-header">
              <i className="bi bi-lightning-fill me-2"></i>
              Truy cập nhanh
            </div>
            <div className="card-body">
              <div className="row g-3">
                {isOwner && (
                  <>
                    <div className="col-6 col-md-4 col-lg-2">
                      <Link to="/stores" className="btn btn-outline-coffee w-100 py-3">
                        <i className="bi bi-shop d-block fs-4 mb-1"></i>
                        Cơ sở
                      </Link>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2">
                      <Link to="/reports" className="btn btn-outline-coffee w-100 py-3">
                        <i className="bi bi-bar-chart-line d-block fs-4 mb-1"></i>
                        Báo cáo
                      </Link>
                    </div>
                  </>
                )}
                {(isOwner || isManager) && (
                  <>
                    <div className="col-6 col-md-4 col-lg-2">
                      <Link to="/users" className="btn btn-outline-coffee w-100 py-3">
                        <i className="bi bi-people d-block fs-4 mb-1"></i>
                        Nhân viên
                      </Link>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2">
                      <Link to="/shifts" className="btn btn-outline-coffee w-100 py-3">
                        <i className="bi bi-calendar3 d-block fs-4 mb-1"></i>
                        Lịch làm
                      </Link>
                    </div>
                    <div className="col-6 col-md-4 col-lg-2">
                      <Link to="/payrolls" className="btn btn-outline-coffee w-100 py-3">
                        <i className="bi bi-cash-stack d-block fs-4 mb-1"></i>
                        Bảng lương
                      </Link>
                    </div>
                  </>
                )}
                <div className="col-6 col-md-4 col-lg-2">
                  <Link to="/requests" className="btn btn-outline-coffee w-100 py-3">
                    <i className="bi bi-file-earmark-text d-block fs-4 mb-1"></i>
                    Yêu cầu
                    {pendingCount > 0 && (
                      <span className="badge bg-danger ms-1">{pendingCount}</span>
                    )}
                  </Link>
                </div>
                {isStaff && (
                  <div className="col-6 col-md-4 col-lg-2">
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
                    <div className="stat-value">{myShifts.length}</div>
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
                  {myShifts.slice(0, 4).map((shift) => (
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
                  {myShifts.length === 0 && (
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

            {/* Quick Actions */}
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
    </div>
  );
};

export default Dashboard;





