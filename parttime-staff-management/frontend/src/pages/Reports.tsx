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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Báo cáo hệ thống</h2>
          <p className="text-muted mb-0">Tổng quan hoạt động toàn hệ thống</p>
        </div>
        <div>
          <input type="month" className="form-control" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
        </div>
      </div>

      {report && (
        <>
          {/* Summary Stats */}
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-lg-3">
              <div className="stat-card primary">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="stat-value">{report.totalStores}</div>
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
                    <div className="stat-value">{report.totalStaff}</div>
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
                    <div className="stat-value">{report.totalHoursWorked}h</div>
                    <div className="stat-label">Tổng giờ làm</div>
                  </div>
                  <i className="bi bi-clock stat-icon"></i>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="stat-card danger">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="stat-value">{formatCurrency(report.totalPayroll)}</div>
                    <div className="stat-label">Tổng lương</div>
                  </div>
                  <i className="bi bi-cash-stack stat-icon"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Store Reports */}
          <div className="card card-coffee">
            <div className="card-header">
              <i className="bi bi-shop me-2"></i>
              Chi tiết theo cơ sở - {formatMonth(selectedMonth)}
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Cơ sở</th>
                      <th className="text-center">Nhân viên</th>
                      <th className="text-center">Ca làm</th>
                      <th className="text-center">Giờ làm</th>
                      <th className="text-end">Tổng lương</th>
                      <th className="text-center">Yêu cầu chờ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.storeReports.map((store) => (
                      <tr key={store.storeId}>
                        <td><strong>{store.storeName}</strong></td>
                        <td className="text-center">{store.totalStaff}</td>
                        <td className="text-center">{store.totalShifts}</td>
                        <td className="text-center">{store.totalHoursWorked}h</td>
                        <td className="text-end">{formatCurrency(store.totalPayroll)}</td>
                        <td className="text-center">
                          {store.pendingRequests > 0 ? (
                            <span className="badge bg-warning">{store.pendingRequests}</span>
                          ) : (
                            <span className="text-muted">0</span>
                          )}
                        </td>
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
                      <th className="text-center">{report.totalPendingRequests}</th>
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








