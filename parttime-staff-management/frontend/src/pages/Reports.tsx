import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import reportService, { SystemReport } from '../api/reportService';
import Loading from '../components/Loading';
import { formatCurrency, getCurrentMonth, formatMonth } from '../utils/formatters';

const Reports: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [report, setReport] = useState<SystemReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  useEffect(() => {
    loadReport();
  }, [selectedMonth]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await reportService.getSystemReport(selectedMonth);
      setReport(response.data);
    } catch (error) {
      console.error('Failed to load report:', error);
    }
    setLoading(false);
  };

  if (loading) return <Loading />;

  return (
    <div>
      {/* Header Section */}
      <div className="card card-coffee mb-4 border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="mb-2 d-flex align-items-center">
                <i className="bi bi-graph-up-arrow me-3 text-primary"></i>
                Báo cáo hệ thống
              </h2>
              <p className="text-muted mb-0">
                <i className="bi bi-calendar3 me-2"></i>
                Tổng quan hoạt động toàn hệ thống - {formatMonth(selectedMonth)}
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="form-label mb-0 fw-semibold">
                <i className="bi bi-calendar-month me-2"></i>
                Chọn tháng:
              </label>
              <input 
                type="month" 
                className="form-control" 
                style={{ width: '200px' }}
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
              />
            </div>
          </div>
        </div>
      </div>

      {report && (
        <>
          {/* Summary Stats - Grouped by Category */}
          <div className="mb-4">
            <h5 className="mb-3 text-muted fw-semibold">
              <i className="bi bi-bar-chart me-2"></i>
              Tổng quan hệ thống
            </h5>
            <div className="row g-3 mb-4">
              {/* Nhân sự */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card primary h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-value">{report.totalStores}</div>
                      <div className="stat-label">Cơ sở</div>
                      <div className="stat-subtitle text-muted small mt-1">
                        <i className="bi bi-shop me-1"></i>
                        Tổng số cơ sở
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      <i className="bi bi-shop stat-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="stat-card info h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-value">{report.totalManagers}</div>
                      <div className="stat-label">Quản lý</div>
                      <div className="stat-subtitle text-muted small mt-1">
                        <i className="bi bi-person-badge me-1"></i>
                        Tổng số quản lý
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      <i className="bi bi-person-badge stat-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="stat-card success h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-value">{report.totalStaff}</div>
                      <div className="stat-label">Nhân viên</div>
                      <div className="stat-subtitle text-muted small mt-1">
                        <i className="bi bi-people me-1"></i>
                        Tổng số nhân viên
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      <i className="bi bi-people stat-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="stat-card warning h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-value">{report.totalHoursWorked}h</div>
                      <div className="stat-label">Tổng giờ làm</div>
                      <div className="stat-subtitle text-muted small mt-1">
                        <i className="bi bi-clock me-1"></i>
                        Giờ làm việc
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      <i className="bi bi-clock stat-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3 mb-4">
              {/* Tài chính */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card danger h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-value" style={{ fontSize: '1.8rem' }}>
                        {formatCurrency(report.totalPayroll)}
                      </div>
                      <div className="stat-label">Tổng lương</div>
                      <div className="stat-subtitle text-muted small mt-1">
                        <i className="bi bi-cash-stack me-1"></i>
                        Chi phí lương tháng này
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      <i className="bi bi-cash-stack stat-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Nhiệm vụ */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card primary h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-value">{report.totalTasks}</div>
                      <div className="stat-label">Tổng nhiệm vụ</div>
                      <div className="stat-subtitle text-muted small mt-1">
                        <i className="bi bi-list-check me-1"></i>
                        Nhiệm vụ trong tháng
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      <i className="bi bi-list-check stat-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="stat-card success h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-value">
                        {report.totalTasks > 0 
                          ? Math.round((report.totalCompletedTasks / report.totalTasks) * 100) 
                          : 0}%
                      </div>
                      <div className="stat-label">Tỷ lệ hoàn thành</div>
                      <div className="stat-subtitle text-muted small mt-1">
                        <i className="bi bi-check-circle me-1"></i>
                        {report.totalCompletedTasks}/{report.totalTasks} hoàn thành
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      <i className="bi bi-check-circle stat-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="stat-card danger h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-value">{report.totalOverdueTasks}</div>
                      <div className="stat-label">Nhiệm vụ quá hạn</div>
                      <div className="stat-subtitle text-muted small mt-1">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Cần xử lý
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      <i className="bi bi-exclamation-triangle stat-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance and Punctuality */}
            <div className="row g-3 mb-4">
              <div className="col-md-6 col-lg-3">
                <div className="stat-card success h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-value">
                        {report.totalAttendanceRate ? report.totalAttendanceRate.toFixed(1) : 0}%
                      </div>
                      <div className="stat-label">Tỷ lệ đi làm</div>
                      <div className="stat-subtitle text-muted small mt-1">
                        <i className="bi bi-calendar-check me-1"></i>
                        {report.totalAttendedShifts}/{report.totalAssignedShifts} ca đã đi
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      <i className="bi bi-calendar-check stat-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="stat-card warning h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-value">{report.totalMissedShifts || 0}</div>
                      <div className="stat-label">Ca vắng mặt</div>
                      <div className="stat-subtitle text-muted small mt-1">
                        <i className="bi bi-x-circle me-1"></i>
                        Ca không đi làm
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      <i className="bi bi-x-circle stat-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="stat-card info h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-value">
                        {report.totalPunctualityRate ? report.totalPunctualityRate.toFixed(1) : 0}%
                      </div>
                      <div className="stat-label">Tỷ lệ đúng giờ</div>
                      <div className="stat-subtitle text-muted small mt-1">
                        <i className="bi bi-clock-history me-1"></i>
                        Check-in/out đúng giờ
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      <i className="bi bi-clock-history stat-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="stat-card danger h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-value">
                        {(report.totalLateCheckIns || 0) + (report.totalEarlyCheckOuts || 0)}
                      </div>
                      <div className="stat-label">Vi phạm giờ giấc</div>
                      <div className="stat-subtitle text-muted small mt-1">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Muộn: {report.totalLateCheckIns || 0} | Sớm: {report.totalEarlyCheckOuts || 0}
                      </div>
                    </div>
                    <div className="stat-icon-wrapper">
                      <i className="bi bi-exclamation-triangle stat-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Store Reports */}
          <div className="card card-coffee shadow-sm border-0 mb-4">
            <div className="card-header bg-gradient-primary text-white border-0">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="mb-0 fw-semibold">
                    <i className="bi bi-shop me-2"></i>
                    Chi tiết theo cơ sở
                  </h5>
                  <small className="opacity-75">Báo cáo chi tiết từng cơ sở trong tháng {formatMonth(selectedMonth)}</small>
                </div>
                <div className="badge bg-white text-primary px-3 py-2">
                  <i className="bi bi-building me-1"></i>
                  {report.totalStores} cơ sở
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold ps-4">
                        <i className="bi bi-shop me-2 text-primary"></i>
                        Cơ sở
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-people me-1"></i>
                        Nhân viên
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-calendar-check me-1"></i>
                        Ca làm
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-clock me-1"></i>
                        Giờ làm
                      </th>
                      <th className="text-end fw-semibold">
                        <i className="bi bi-cash-stack me-1"></i>
                        Tổng lương
                      </th>
                      <th className="text-center fw-semibold pe-4">
                        <i className="bi bi-envelope-paper me-1"></i>
                        Yêu cầu
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.storeReports.map((store, index) => (
                      <tr key={store.storeId} className="border-bottom">
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="store-icon-wrapper me-2">
                              <i className="bi bi-shop text-primary"></i>
                            </div>
                            <div>
                              <strong className="d-block">{store.storeName}</strong>
                              <small className="text-muted">Cơ sở #{index + 1}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-info-subtle text-info-emphasis px-3 py-2">
                            {store.totalStaff}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-primary-subtle text-primary-emphasis px-3 py-2">
                            {store.totalShifts}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="fw-semibold text-warning-emphasis">
                            {store.totalHoursWorked}h
                          </span>
                        </td>
                        <td className="text-end">
                          <span className="fw-bold text-danger-emphasis">
                            {formatCurrency(store.totalPayroll)}
                          </span>
                        </td>
                        <td className="text-center pe-4">
                          <div className="d-flex flex-column gap-1 align-items-center">
                            {store.pendingRequests > 0 && (
                              <span className="badge bg-warning text-dark px-2 py-1" title="Yêu cầu chờ xử lý">
                                <i className="bi bi-hourglass-split me-1"></i>
                                {store.pendingRequests} chờ
                              </span>
                            )}
                            {store.approvedRequests > 0 && (
                              <span className="badge bg-success-subtle text-success-emphasis px-2 py-1" title="Yêu cầu đã chấp nhận">
                                <i className="bi bi-check-circle me-1"></i>
                                {store.approvedRequests} chấp nhận
                              </span>
                            )}
                            {store.rejectedRequests > 0 && (
                              <span className="badge bg-danger-subtle text-danger-emphasis px-2 py-1" title="Yêu cầu đã từ chối">
                                <i className="bi bi-x-circle me-1"></i>
                                {store.rejectedRequests} từ chối
                              </span>
                            )}
                            {store.pendingRequests === 0 && store.approvedRequests === 0 && store.rejectedRequests === 0 && (
                              <span className="text-muted small">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light bg-primary-subtle">
                    <tr>
                      <th className="ps-4 fw-bold text-primary">
                        <i className="bi bi-calculator me-2"></i>
                        Tổng cộng
                      </th>
                      <th className="text-center fw-bold">{report.totalStaff}</th>
                      <th className="text-center fw-bold">{report.totalShifts}</th>
                      <th className="text-center fw-bold">{report.totalHoursWorked}h</th>
                      <th className="text-end fw-bold text-danger-emphasis">{formatCurrency(report.totalPayroll)}</th>
                      <th className="text-center fw-bold pe-4">
                        {report.totalPendingRequests > 0 ? (
                          <span className="badge bg-warning text-dark px-3 py-2">
                            {report.totalPendingRequests}
                          </span>
                        ) : (
                          <span className="text-muted">0</span>
                        )}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Attendance and Punctuality Statistics Table */}
          <div className="card card-coffee shadow-sm border-0 mb-4">
            <div className="card-header bg-gradient-primary text-white border-0">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="mb-0 fw-semibold">
                    <i className="bi bi-calendar-check me-2"></i>
                    Thống kê đi làm và đúng giờ
                  </h5>
                  <small className="opacity-75">Chi tiết tỷ lệ đi làm và đúng giờ theo từng cơ sở trong tháng {formatMonth(selectedMonth)}</small>
                </div>
                <div className="badge bg-white text-primary px-3 py-2">
                  <i className="bi bi-clock-history me-1"></i>
                  {report.totalAssignedShifts || 0} ca phân công
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold ps-4">
                        <i className="bi bi-shop me-2 text-primary"></i>
                        Cơ sở
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-calendar-check me-1"></i>
                        Tổng ca phân công
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-check-circle me-1"></i>
                        Số ca đã đi
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-x-circle me-1"></i>
                        Ca vắng mặt
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-percent me-1"></i>
                        Tỷ lệ đi làm
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-clock-fill me-1"></i>
                        Check-in muộn
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-clock me-1"></i>
                        Check-out sớm
                      </th>
                      <th className="text-center fw-semibold pe-4">
                        <i className="bi bi-percent me-1"></i>
                        Tỷ lệ đúng giờ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.storeReports.map((store, index) => {
                      const attendanceLevel = (store.attendanceRate || 0) >= 90 ? 'success' : 
                                            (store.attendanceRate || 0) >= 80 ? 'warning' : 'danger';
                      const punctualityLevel = (store.punctualityRate || 0) >= 90 ? 'success' : 
                                              (store.punctualityRate || 0) >= 80 ? 'warning' : 'danger';
                      
                      return (
                        <tr key={store.storeId} className="border-bottom">
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <div className="store-icon-wrapper me-2">
                                <i className="bi bi-shop text-primary"></i>
                              </div>
                              <div>
                                <strong className="d-block">{store.storeName}</strong>
                                <small className="text-muted">Cơ sở #{index + 1}</small>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-primary px-3 py-2 fw-semibold">
                              {store.totalAssignedShifts || 0}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-success px-3 py-2 fw-semibold">
                              <i className="bi bi-check-circle me-1"></i>
                              {store.attendedShifts || 0}
                            </span>
                          </td>
                          <td className="text-center">
                            {(store.missedShifts || 0) > 0 ? (
                              <span className="badge bg-danger px-3 py-2 fw-semibold">
                                <i className="bi bi-x-circle me-1"></i>
                                {store.missedShifts || 0}
                              </span>
                            ) : (
                              <span className="badge bg-success-subtle text-success-emphasis px-3 py-2">
                                <i className="bi bi-check-circle me-1"></i>
                                0
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            <div className="d-flex flex-column align-items-center gap-1">
                              <span className={`badge bg-${attendanceLevel} px-3 py-2 fw-semibold`}>
                                {store.attendanceRate ? store.attendanceRate.toFixed(1) : 0}%
                              </span>
                              <div className="progress" style={{ width: '80px', height: '6px' }}>
                                <div 
                                  className={`progress-bar bg-${attendanceLevel}`}
                                  role="progressbar" 
                                  style={{ width: `${store.attendanceRate || 0}%` }}
                                  aria-valuenow={store.attendanceRate || 0} 
                                  aria-valuemin={0} 
                                  aria-valuemax={100}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            {(store.lateCheckIns || 0) > 0 ? (
                              <span className="badge bg-warning text-dark px-3 py-2 fw-semibold">
                                <i className="bi bi-clock-fill me-1"></i>
                                {store.lateCheckIns || 0}
                              </span>
                            ) : (
                              <span className="badge bg-success-subtle text-success-emphasis px-3 py-2">
                                <i className="bi bi-check-circle me-1"></i>
                                0
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            {(store.earlyCheckOuts || 0) > 0 ? (
                              <span className="badge bg-warning text-dark px-3 py-2 fw-semibold">
                                <i className="bi bi-clock me-1"></i>
                                {store.earlyCheckOuts || 0}
                              </span>
                            ) : (
                              <span className="badge bg-success-subtle text-success-emphasis px-3 py-2">
                                <i className="bi bi-check-circle me-1"></i>
                                0
                              </span>
                            )}
                          </td>
                          <td className="text-center pe-4">
                            <div className="d-flex flex-column align-items-center gap-1">
                              <span className={`badge bg-${punctualityLevel} px-3 py-2 fw-semibold`}>
                                {store.punctualityRate ? store.punctualityRate.toFixed(1) : 0}%
                              </span>
                              <div className="progress" style={{ width: '80px', height: '6px' }}>
                                <div 
                                  className={`progress-bar bg-${punctualityLevel}`}
                                  role="progressbar" 
                                  style={{ width: `${store.punctualityRate || 0}%` }}
                                  aria-valuenow={store.punctualityRate || 0} 
                                  aria-valuemin={0} 
                                  aria-valuemax={100}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-light bg-primary-subtle">
                    <tr>
                      <th className="ps-4 fw-bold text-primary">
                        <i className="bi bi-calculator me-2"></i>
                        Tổng cộng
                      </th>
                      <th className="text-center fw-bold">
                        <span className="badge bg-primary px-3 py-2">
                          {report.totalAssignedShifts || 0}
                        </span>
                      </th>
                      <th className="text-center fw-bold">
                        <span className="badge bg-success px-3 py-2">
                          {report.totalAttendedShifts || 0}
                        </span>
                      </th>
                      <th className="text-center fw-bold">
                        {report.totalMissedShifts > 0 ? (
                          <span className="badge bg-danger px-3 py-2">
                            {report.totalMissedShifts || 0}
                          </span>
                        ) : (
                          <span className="text-success">0</span>
                        )}
                      </th>
                      <th className="text-center fw-bold">
                        <span className={`badge px-3 py-2 ${
                          (report.totalAttendanceRate || 0) >= 90 ? 'bg-success' :
                          (report.totalAttendanceRate || 0) >= 80 ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {report.totalAttendanceRate ? report.totalAttendanceRate.toFixed(1) : 0}%
                        </span>
                      </th>
                      <th className="text-center fw-bold">
                        {report.totalLateCheckIns > 0 ? (
                          <span className="badge bg-warning text-dark px-3 py-2">
                            {report.totalLateCheckIns || 0}
                          </span>
                        ) : (
                          <span className="text-success">0</span>
                        )}
                      </th>
                      <th className="text-center fw-bold">
                        {report.totalEarlyCheckOuts > 0 ? (
                          <span className="badge bg-warning text-dark px-3 py-2">
                            {report.totalEarlyCheckOuts || 0}
                          </span>
                        ) : (
                          <span className="text-success">0</span>
                        )}
                      </th>
                      <th className="text-center fw-bold pe-4">
                        <span className={`badge px-3 py-2 ${
                          (report.totalPunctualityRate || 0) >= 90 ? 'bg-success' :
                          (report.totalPunctualityRate || 0) >= 80 ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {report.totalPunctualityRate ? report.totalPunctualityRate.toFixed(1) : 0}%
                        </span>
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Task Statistics Table */}
          <div className="card card-coffee shadow-sm border-0">
            <div className="card-header bg-gradient-primary text-white border-0">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="mb-0 fw-semibold">
                    <i className="bi bi-list-check me-2"></i>
                    Thống kê nhiệm vụ
                  </h5>
                  <small className="opacity-75">Chi tiết nhiệm vụ theo từng cơ sở trong tháng {formatMonth(selectedMonth)}</small>
                </div>
                <div className="badge bg-white text-primary px-3 py-2">
                  <i className="bi bi-clipboard-data me-1"></i>
                  {report.totalTasks} nhiệm vụ
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold ps-4">
                        <i className="bi bi-shop me-2 text-primary"></i>
                        Cơ sở
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-list-ul me-1"></i>
                        Tổng nhiệm vụ
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-hourglass-split me-1"></i>
                        Chờ xử lý
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-play-circle me-1"></i>
                        Đang làm
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-check-circle me-1"></i>
                        Hoàn thành
                      </th>
                      <th className="text-center fw-semibold">
                        <i className="bi bi-percent me-1"></i>
                        Tỷ lệ hoàn thành
                      </th>
                      <th className="text-center fw-semibold pe-4">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Quá hạn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.storeReports.map((store, index) => {
                      const completionRate = store.totalTasks > 0 
                        ? Math.round((store.completedTasks / store.totalTasks) * 100) 
                        : 0;
                      const performanceLevel = completionRate >= 80 ? 'success' : completionRate >= 60 ? 'warning' : 'danger';
                      
                      return (
                        <tr key={store.storeId} className="border-bottom">
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <div className="store-icon-wrapper me-2">
                                <i className="bi bi-shop text-primary"></i>
                              </div>
                              <div>
                                <strong className="d-block">{store.storeName}</strong>
                                <small className="text-muted">Cơ sở #{index + 1}</small>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-primary px-3 py-2 fw-semibold">
                              {store.totalTasks}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-secondary px-3 py-2">
                              {store.pendingTasks}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-info px-3 py-2">
                              {store.inProgressTasks}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-success px-3 py-2 fw-semibold">
                              <i className="bi bi-check-circle me-1"></i>
                              {store.completedTasks}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="d-flex flex-column align-items-center gap-1">
                              <span className={`badge bg-${performanceLevel}-subtle text-${performanceLevel}-emphasis px-3 py-2 fw-semibold`}>
                                {completionRate}%
                              </span>
                              <div className="progress" style={{ width: '80px', height: '6px' }}>
                                <div 
                                  className={`progress-bar bg-${performanceLevel}`}
                                  role="progressbar" 
                                  style={{ width: `${completionRate}%` }}
                                  aria-valuenow={completionRate} 
                                  aria-valuemin={0} 
                                  aria-valuemax={100}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center pe-4">
                            {store.overdueTasks > 0 ? (
                              <span className="badge bg-danger px-3 py-2 fw-semibold">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                {store.overdueTasks}
                              </span>
                            ) : (
                              <span className="badge bg-success-subtle text-success-emphasis px-3 py-2">
                                <i className="bi bi-check-circle me-1"></i>
                                0
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-light bg-primary-subtle">
                    <tr>
                      <th className="ps-4 fw-bold text-primary">
                        <i className="bi bi-calculator me-2"></i>
                        Tổng cộng
                      </th>
                      <th className="text-center fw-bold">{report.totalTasks}</th>
                      <th className="text-center fw-bold">
                        {report.storeReports.reduce((sum, s) => sum + s.pendingTasks, 0)}
                      </th>
                      <th className="text-center fw-bold">
                        {report.storeReports.reduce((sum, s) => sum + s.inProgressTasks, 0)}
                      </th>
                      <th className="text-center fw-bold">{report.totalCompletedTasks}</th>
                      <th className="text-center fw-bold">
                        <span className="badge bg-success px-3 py-2">
                          {report.totalTasks > 0 
                            ? Math.round((report.totalCompletedTasks / report.totalTasks) * 100) 
                            : 0}%
                        </span>
                      </th>
                      <th className="text-center fw-bold pe-4">
                        {report.totalOverdueTasks > 0 ? (
                          <span className="badge bg-danger px-3 py-2">{report.totalOverdueTasks}</span>
                        ) : (
                          <span className="text-success">0</span>
                        )}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;








