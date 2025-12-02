import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { generatePayroll, fetchPayrollsByMonth, updatePayroll } from '../features/payroll/payrollSlice';
import { fetchStores } from '../features/stores/storeSlice';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { formatCurrency, getCurrentMonth, formatMonth } from '../utils/formatters';

const Payrolls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { payrolls, loading } = useSelector((state: RootState) => state.payroll);
  const { stores } = useSelector((state: RootState) => state.stores);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ show: false, message: '', type: 'success' });

  const isOwner = user?.role === 'OWNER';

  useEffect(() => {
    dispatch(fetchStores());
  }, [dispatch]);

  useEffect(() => {
    if (isOwner) {
      dispatch(fetchPayrollsByMonth(selectedMonth));
    } else if (user?.storeId) {
      dispatch(generatePayroll({ month: selectedMonth, storeId: user.storeId }));
    }
  }, [dispatch, selectedMonth, isOwner, user?.storeId]);

  const handleGenerate = async () => {
    try {
      await dispatch(generatePayroll({ month: selectedMonth, storeId: user?.storeId })).unwrap();
      setToast({ show: true, message: 'Tạo bảng lương thành công!', type: 'success' });
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await dispatch(updatePayroll({ id, data: { status: 'APPROVED' } })).unwrap();
      setToast({ show: true, message: 'Đã duyệt bảng lương!', type: 'success' });
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      DRAFT: { class: 'bg-secondary', label: 'Bản nháp' },
      APPROVED: { class: 'bg-success', label: 'Đã duyệt' },
      PAID: { class: 'bg-primary', label: 'Đã thanh toán' },
    };
    return badges[status] || { class: 'bg-secondary', label: status };
  };

  const totalGross = payrolls.reduce((sum, p) => sum + p.grossPay, 0);
  const totalNet = payrolls.reduce((sum, p) => sum + p.netPay, 0);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Bảng lương</h2>
          <p className="text-muted mb-0">Quản lý lương nhân viên theo tháng</p>
        </div>
        <button className="btn btn-coffee" onClick={handleGenerate}>
          <i className="bi bi-calculator me-2"></i>
          Tính lương
        </button>
      </div>

      {/* Filter */}
      <div className="card card-coffee mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <label className="form-label mb-0">Tháng:</label>
            </div>
            <div className="col-md-3">
              <input type="month" className="form-control" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
            </div>
            <div className="col-auto">
              <span className="text-muted">{formatMonth(selectedMonth)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-card primary">
            <div className="stat-value">{payrolls.length}</div>
            <div className="stat-label">Nhân viên</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card success">
            <div className="stat-value">{formatCurrency(totalGross)}</div>
            <div className="stat-label">Tổng lương</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card warning">
            <div className="stat-value">{formatCurrency(totalNet)}</div>
            <div className="stat-label">Thực lĩnh</div>
          </div>
        </div>
      </div>

      {/* Payrolls Table */}
      <div className="card card-coffee">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-coffee mb-0">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Cơ sở</th>
                  <th className="text-center">Giờ làm</th>
                  <th className="text-end">Lương/giờ</th>
                  <th className="text-end">Tổng lương</th>
                  <th className="text-end">Điều chỉnh</th>
                  <th className="text-end">Thực lĩnh</th>
                  <th className="text-center">Trạng thái</th>
                  {isOwner && <th className="text-center">Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll.id}>
                    <td>
                      <strong>{payroll.userName}</strong>
                      <br />
                      <small className="text-muted">{payroll.userEmail}</small>
                    </td>
                    <td>{payroll.storeName || '---'}</td>
                    <td className="text-center">{payroll.totalHours}h</td>
                    <td className="text-end">{payroll.hourlyRate ? formatCurrency(payroll.hourlyRate) : '---'}</td>
                    <td className="text-end">{formatCurrency(payroll.grossPay)}</td>
                    <td className="text-end">
                      <span className={payroll.adjustments >= 0 ? 'text-success' : 'text-danger'}>
                        {payroll.adjustments >= 0 ? '+' : ''}{formatCurrency(payroll.adjustments)}
                      </span>
                      {payroll.adjustmentNote && (
                        <small className="d-block text-muted">{payroll.adjustmentNote}</small>
                      )}
                    </td>
                    <td className="text-end fw-bold">{formatCurrency(payroll.netPay)}</td>
                    <td className="text-center">
                      <span className={`badge ${getStatusBadge(payroll.status).class}`}>
                        {getStatusBadge(payroll.status).label}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="text-center">
                        {payroll.status === 'DRAFT' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleApprove(payroll.id)}>
                            Duyệt
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {payrolls.length === 0 && (
                  <tr>
                    <td colSpan={isOwner ? 9 : 8} className="text-center py-4 text-muted">
                      Chưa có dữ liệu lương. Nhấn "Tính lương" để tạo bảng lương.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
};

export default Payrolls;

