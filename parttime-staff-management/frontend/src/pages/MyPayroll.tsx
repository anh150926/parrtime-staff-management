import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchMyPayrollHistory } from '../features/payroll/payrollSlice';
import Loading from '../components/Loading';
import { formatCurrency, formatMonth, formatDateTime } from '../utils/formatters';
import { Payroll } from '../api/payrollService';

const MyPayroll: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { myPayrollHistory, loading } = useSelector((state: RootState) => state.payroll);

  useEffect(() => {
    dispatch(fetchMyPayrollHistory());
  }, [dispatch]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string; icon: string }> = {
      DRAFT: { class: 'bg-secondary', label: 'Bản nháp', icon: 'bi-file-earmark' },
      APPROVED: { class: 'bg-success', label: 'Đã duyệt', icon: 'bi-check-circle' },
      PAID: { class: 'bg-primary', label: 'Đã thanh toán', icon: 'bi-cash-coin' },
    };
    return badges[status] || { class: 'bg-secondary', label: status, icon: 'bi-question-circle' };
  };

  // Sort payrolls by month (newest first)
  const sortedPayrolls = useMemo(() => {
    return [...myPayrollHistory].sort((a, b) => b.month.localeCompare(a.month));
  }, [myPayrollHistory]);

  // Statistics
  const stats = useMemo(() => {
    const totalEarnings = sortedPayrolls.reduce((sum, p) => sum + (p.status === 'PAID' ? p.netPay : 0), 0);
    const pendingEarnings = sortedPayrolls.reduce((sum, p) => sum + (p.status !== 'PAID' ? p.netPay : 0), 0);
    const totalHours = sortedPayrolls.reduce((sum, p) => sum + p.totalHours, 0);
    const paidCount = sortedPayrolls.filter(p => p.status === 'PAID').length;
    
    return { totalEarnings, pendingEarnings, totalHours, paidCount };
  }, [sortedPayrolls]);

  // Get current month's payroll
  const currentMonthPayroll = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return sortedPayrolls.find(p => p.month === currentMonth);
  }, [sortedPayrolls]);

  if (loading) return <Loading />;

  return (
    <div className="my-payroll-page">
      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-1">
          <i className="bi bi-wallet2 me-2 text-coffee"></i>
          Lương của tôi
        </h2>
        <p className="text-muted mb-0">Xem lịch sử lương và các khoản thanh toán</p>
      </div>

      {/* Current Month Highlight */}
      {currentMonthPayroll && (
        <div className="card card-coffee mb-4 border-primary" style={{ borderWidth: '2px' }}>
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-calendar-check me-2"></i>
              Tháng hiện tại - {formatMonth(currentMonthPayroll.month)}
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <div className="text-muted small mb-1">Số giờ làm</div>
                  <div className="fs-3 fw-bold text-primary">{currentMonthPayroll.totalHours}h</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <div className="text-muted small mb-1">Lương gốc</div>
                  <div className="fs-4 fw-bold">{formatCurrency(currentMonthPayroll.grossPay)}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <div className="text-muted small mb-1">Điều chỉnh</div>
                  <div className={`fs-4 fw-bold ${currentMonthPayroll.adjustments >= 0 ? 'text-success' : 'text-danger'}`}>
                    {currentMonthPayroll.adjustments >= 0 ? '+' : ''}{formatCurrency(currentMonthPayroll.adjustments)}
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-success bg-opacity-10 rounded border border-success">
                  <div className="text-muted small mb-1">Thực lĩnh</div>
                  <div className="fs-3 fw-bold text-success">{formatCurrency(currentMonthPayroll.netPay)}</div>
                </div>
              </div>
            </div>
            
            {currentMonthPayroll.adjustmentNote && (
              <div className="alert alert-warning mt-3 mb-0">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Ghi chú:</strong> {currentMonthPayroll.adjustmentNote}
              </div>
            )}
            
            <div className="mt-3 text-end">
              <span className={`badge ${getStatusBadge(currentMonthPayroll.status).class} fs-6`}>
                <i className={`${getStatusBadge(currentMonthPayroll.status).icon} me-1`}></i>
                {getStatusBadge(currentMonthPayroll.status).label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="stat-card success">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-value">{formatCurrency(stats.totalEarnings)}</div>
                <div className="stat-label">Đã nhận</div>
              </div>
              <i className="bi bi-cash-coin stat-icon"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card warning">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-value">{formatCurrency(stats.pendingEarnings)}</div>
                <div className="stat-label">Chờ thanh toán</div>
              </div>
              <i className="bi bi-hourglass-split stat-icon"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card primary">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-value">{stats.totalHours.toFixed(1)}h</div>
                <div className="stat-label">Tổng giờ làm</div>
              </div>
              <i className="bi bi-clock stat-icon"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card info">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-value">{stats.paidCount}</div>
                <div className="stat-label">Tháng đã thanh toán</div>
              </div>
              <i className="bi bi-calendar-check stat-icon"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll History */}
      <div className="card card-coffee">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>
            Lịch sử lương
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-coffee mb-0">
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th className="text-center">Giờ làm</th>
                  <th className="text-end">Lương/giờ</th>
                  <th className="text-end">Lương gốc</th>
                  <th className="text-end">Điều chỉnh</th>
                  <th className="text-end">Thực lĩnh</th>
                  <th className="text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayrolls.map((payroll) => (
                  <tr 
                    key={payroll.id} 
                    className={payroll.status === 'PAID' ? 'table-success-light' : ''}
                  >
                    <td>
                      <div className="fw-semibold">{formatMonth(payroll.month)}</div>
                      <small className="text-muted">
                        <i className="bi bi-calendar3 me-1"></i>
                        {payroll.month}
                      </small>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark">{payroll.totalHours}h</span>
                    </td>
                    <td className="text-end">
                      {payroll.hourlyRate ? formatCurrency(payroll.hourlyRate) : '---'}
                    </td>
                    <td className="text-end">{formatCurrency(payroll.grossPay)}</td>
                    <td className="text-end">
                      <span className={payroll.adjustments >= 0 ? 'text-success' : 'text-danger'}>
                        {payroll.adjustments >= 0 ? '+' : ''}{formatCurrency(payroll.adjustments)}
                      </span>
                      {payroll.adjustmentNote && (
                        <i 
                          className="bi bi-info-circle ms-1 text-muted" 
                          title={payroll.adjustmentNote}
                          style={{ cursor: 'help' }}
                        ></i>
                      )}
                    </td>
                    <td className="text-end">
                      <span className="fw-bold text-primary">{formatCurrency(payroll.netPay)}</span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${getStatusBadge(payroll.status).class}`}>
                        <i className={`${getStatusBadge(payroll.status).icon} me-1`}></i>
                        {getStatusBadge(payroll.status).label}
                      </span>
                    </td>
                  </tr>
                ))}
                {sortedPayrolls.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="text-muted">
                        <i className="bi bi-inbox display-4 d-block mb-3"></i>
                        <p className="mb-0">Chưa có dữ liệu lương.</p>
                        <p className="small">Lương sẽ được tính sau khi bạn có giờ làm việc.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="alert alert-info mt-4">
        <h6 className="alert-heading">
          <i className="bi bi-lightbulb me-2"></i>
          Lưu ý
        </h6>
        <ul className="mb-0">
          <li><strong>Bản nháp:</strong> Lương đang được tính toán, có thể thay đổi.</li>
          <li><strong>Đã duyệt:</strong> Lương đã được chủ cửa hàng xác nhận, chờ thanh toán.</li>
          <li><strong>Đã thanh toán:</strong> Lương đã được chuyển khoản/trả cho bạn.</li>
          <li>Điều chỉnh có thể bao gồm: thưởng, phạt đi muộn, khấu trừ từ khiếu nại...</li>
        </ul>
      </div>

      {/* Styles */}
      <style>{`
        .table-success-light {
          background-color: rgba(25, 135, 84, 0.05);
        }
      `}</style>
    </div>
  );
};

export default MyPayroll;

