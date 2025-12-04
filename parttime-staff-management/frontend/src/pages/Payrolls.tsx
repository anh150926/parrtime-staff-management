import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { generatePayroll, fetchPayrollsByMonth, fetchPayrollsByStoreAndMonth, updatePayroll } from '../features/payroll/payrollSlice';
import { fetchStores } from '../features/stores/storeSlice';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { formatCurrency, getCurrentMonth, formatMonth, formatDateTime } from '../utils/formatters';
import { Payroll } from '../api/payrollService';

const Payrolls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { payrolls, loading } = useSelector((state: RootState) => state.payroll);
  const { stores } = useSelector((state: RootState) => state.stores);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedStoreId, setSelectedStoreId] = useState<number | ''>('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ show: false, message: '', type: 'success' });
  
  // Modal states
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'paid' | null>(null);
  
  // Adjustment form
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentNote, setAdjustmentNote] = useState('');

  const isOwner = user?.role === 'OWNER';
  const isManager = user?.role === 'MANAGER';

  useEffect(() => {
    if (isOwner) {
      dispatch(fetchStores());
    }
  }, [dispatch, isOwner]);

  useEffect(() => {
    loadPayrolls();
  }, [dispatch, selectedMonth, selectedStoreId, isOwner, isManager, user?.storeId]);

  const loadPayrolls = () => {
    if (isOwner) {
      if (selectedStoreId) {
        dispatch(fetchPayrollsByStoreAndMonth({ storeId: Number(selectedStoreId), month: selectedMonth }));
      } else {
        dispatch(fetchPayrollsByMonth(selectedMonth));
      }
    } else if (isManager && user?.storeId) {
      dispatch(fetchPayrollsByStoreAndMonth({ storeId: user.storeId, month: selectedMonth }));
    }
  };

  const handleGenerate = async () => {
    try {
      const storeId = isOwner ? (selectedStoreId ? Number(selectedStoreId) : undefined) : user?.storeId;
      await dispatch(generatePayroll({ month: selectedMonth, storeId })).unwrap();
      setToast({ show: true, message: 'Tính lương thành công!', type: 'success' });
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleApprove = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setConfirmAction('approve');
    setShowConfirmModal(true);
  };

  const handleMarkPaid = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setConfirmAction('paid');
    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedPayroll || !confirmAction) return;
    
    try {
      const newStatus = confirmAction === 'approve' ? 'APPROVED' : 'PAID';
      await dispatch(updatePayroll({ id: selectedPayroll.id, data: { status: newStatus } })).unwrap();
      setToast({ 
        show: true, 
        message: confirmAction === 'approve' ? 'Đã duyệt bảng lương!' : 'Đã đánh dấu thanh toán!', 
        type: 'success' 
      });
      setShowConfirmModal(false);
      setSelectedPayroll(null);
      setConfirmAction(null);
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const openAdjustModal = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setAdjustmentAmount(payroll.adjustments || 0);
    setAdjustmentNote(payroll.adjustmentNote || '');
    setShowAdjustModal(true);
  };

  const handleSaveAdjustment = async () => {
    if (!selectedPayroll) return;
    
    try {
      await dispatch(updatePayroll({ 
        id: selectedPayroll.id, 
        data: { 
          adjustments: adjustmentAmount, 
          adjustmentNote: adjustmentNote 
        } 
      })).unwrap();
      setToast({ show: true, message: 'Đã cập nhật điều chỉnh!', type: 'success' });
      setShowAdjustModal(false);
      setSelectedPayroll(null);
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const openDetailModal = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setShowDetailModal(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Nhân viên', 'Email', 'Cơ sở', 'Giờ làm', 'Lương/giờ', 'Tổng lương', 'Điều chỉnh', 'Thực lĩnh', 'Trạng thái'];
    const rows = payrolls.map(p => [
      p.userName,
      p.userEmail,
      p.storeName || '',
      p.totalHours,
      p.hourlyRate || 0,
      p.grossPay,
      p.adjustments,
      p.netPay,
      getStatusLabel(p.status)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bang-luong-${selectedMonth}.csv`;
    link.click();

    setToast({ show: true, message: 'Đã xuất file CSV!', type: 'success' });
  };

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string; icon: string }> = {
      DRAFT: { class: 'bg-secondary', label: 'Bản nháp', icon: 'bi-file-earmark' },
      APPROVED: { class: 'bg-success', label: 'Đã duyệt', icon: 'bi-check-circle' },
      PAID: { class: 'bg-primary', label: 'Đã thanh toán', icon: 'bi-cash-coin' },
    };
    return badges[status] || { class: 'bg-secondary', label: status, icon: 'bi-question-circle' };
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Bản nháp',
      APPROVED: 'Đã duyệt',
      PAID: 'Đã thanh toán',
    };
    return labels[status] || status;
  };

  // Statistics
  const stats = useMemo(() => {
    const totalGross = payrolls.reduce((sum, p) => sum + p.grossPay, 0);
    const totalNet = payrolls.reduce((sum, p) => sum + p.netPay, 0);
    const totalAdjustments = payrolls.reduce((sum, p) => sum + p.adjustments, 0);
    const totalHours = payrolls.reduce((sum, p) => sum + p.totalHours, 0);
    const draftCount = payrolls.filter(p => p.status === 'DRAFT').length;
    const approvedCount = payrolls.filter(p => p.status === 'APPROVED').length;
    const paidCount = payrolls.filter(p => p.status === 'PAID').length;
    
    return { totalGross, totalNet, totalAdjustments, totalHours, draftCount, approvedCount, paidCount };
  }, [payrolls]);

  if (loading) return <Loading />;

  return (
    <div className="payroll-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-wallet2 me-2 text-coffee"></i>
            Bảng lương
          </h2>
          <p className="text-muted mb-0">Quản lý lương nhân viên theo tháng - {formatMonth(selectedMonth)}</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-coffee" onClick={handleExportCSV} disabled={payrolls.length === 0}>
            <i className="bi bi-file-earmark-spreadsheet me-2"></i>
            Xuất CSV
          </button>
          <button className="btn btn-outline-coffee" onClick={handlePrint} disabled={payrolls.length === 0}>
            <i className="bi bi-printer me-2"></i>
            In
          </button>
          <button className="btn btn-coffee" onClick={handleGenerate}>
            <i className="bi bi-calculator me-2"></i>
            Tính lương
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-coffee mb-4">
        <div className="card-body">
          <div className="row align-items-end g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                <i className="bi bi-calendar3 me-2"></i>Tháng
              </label>
              <input 
                type="month" 
                className="form-control" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
              />
            </div>
            {isOwner && (
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-shop me-2"></i>Cơ sở
                </label>
                <select 
                  className="form-select" 
                  value={selectedStoreId} 
                  onChange={(e) => setSelectedStoreId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Tất cả cơ sở</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-auto">
              <span className="badge bg-coffee-light fs-6 py-2 px-3">
                <i className="bi bi-people me-2"></i>
                {payrolls.length} nhân viên
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
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
          <div className="stat-card success">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-value">{formatCurrency(stats.totalGross)}</div>
                <div className="stat-label">Tổng lương</div>
              </div>
              <i className="bi bi-cash-stack stat-icon"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card warning">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-value" style={{ fontSize: stats.totalAdjustments !== 0 ? '1.5rem' : '2.25rem' }}>
                  {stats.totalAdjustments >= 0 ? '+' : ''}{formatCurrency(stats.totalAdjustments)}
                </div>
                <div className="stat-label">Điều chỉnh</div>
              </div>
              <i className="bi bi-plus-slash-minus stat-icon"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card info">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-value">{formatCurrency(stats.totalNet)}</div>
                <div className="stat-label">Thực lĩnh</div>
              </div>
              <i className="bi bi-wallet2 stat-icon"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-12">
          <div className="card card-coffee">
            <div className="card-body py-3">
              <div className="d-flex justify-content-center gap-4 flex-wrap">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-secondary fs-6 py-2 px-3">
                    <i className="bi bi-file-earmark me-1"></i>
                    {stats.draftCount} Bản nháp
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success fs-6 py-2 px-3">
                    <i className="bi bi-check-circle me-1"></i>
                    {stats.approvedCount} Đã duyệt
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary fs-6 py-2 px-3">
                    <i className="bi bi-cash-coin me-1"></i>
                    {stats.paidCount} Đã thanh toán
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payrolls Table */}
      <div className="card card-coffee" id="payroll-table">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-coffee mb-0">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>#</th>
                  <th style={{ width: '20%' }}>Nhân viên</th>
                  <th style={{ width: '12%' }}>Cơ sở</th>
                  <th className="text-center" style={{ width: '8%' }}>Giờ làm</th>
                  <th className="text-end" style={{ width: '10%' }}>Lương/giờ</th>
                  <th className="text-end" style={{ width: '12%' }}>Tổng lương</th>
                  <th className="text-end" style={{ width: '10%' }}>Điều chỉnh</th>
                  <th className="text-end" style={{ width: '12%' }}>Thực lĩnh</th>
                  <th className="text-center" style={{ width: '10%' }}>Trạng thái</th>
                  {(isOwner || isManager) && <th className="text-center" style={{ width: '12%' }}>Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll, index) => (
                  <tr key={payroll.id} className={payroll.status === 'PAID' ? 'table-success-light' : ''}>
                    <td className="text-muted">{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar avatar-sm">
                          {payroll.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{payroll.userName}</strong>
                          <br />
                          <small className="text-muted">{payroll.userEmail}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        <i className="bi bi-shop me-1"></i>
                        {payroll.storeName || '---'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="fw-semibold">{payroll.totalHours}h</span>
                    </td>
                    <td className="text-end">
                      {payroll.hourlyRate ? formatCurrency(payroll.hourlyRate) : '---'}
                    </td>
                    <td className="text-end fw-semibold">{formatCurrency(payroll.grossPay)}</td>
                    <td className="text-end">
                      <span className={`fw-semibold ${payroll.adjustments >= 0 ? 'text-success' : 'text-danger'}`}>
                        {payroll.adjustments >= 0 ? '+' : ''}{formatCurrency(payroll.adjustments)}
                      </span>
                      {payroll.adjustmentNote && (
                        <i 
                          className="bi bi-info-circle ms-1 text-muted" 
                          title={payroll.adjustmentNote}
                          style={{ cursor: 'pointer' }}
                          onClick={() => openDetailModal(payroll)}
                        ></i>
                      )}
                    </td>
                    <td className="text-end">
                      <span className="fw-bold text-primary" style={{ fontSize: '1.05rem' }}>
                        {formatCurrency(payroll.netPay)}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${getStatusBadge(payroll.status).class}`}>
                        <i className={`${getStatusBadge(payroll.status).icon} me-1`}></i>
                        {getStatusBadge(payroll.status).label}
                      </span>
                    </td>
                    {(isOwner || isManager) && (
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-secondary" 
                            title="Chi tiết"
                            onClick={() => openDetailModal(payroll)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {payroll.status === 'DRAFT' && (
                            <>
                              <button 
                                className="btn btn-outline-warning" 
                                title="Điều chỉnh"
                                onClick={() => openAdjustModal(payroll)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              {isOwner && (
                                <button 
                                  className="btn btn-outline-success" 
                                  title="Duyệt"
                                  onClick={() => handleApprove(payroll)}
                                >
                                  <i className="bi bi-check-lg"></i>
                                </button>
                              )}
                            </>
                          )}
                          {payroll.status === 'APPROVED' && isOwner && (
                            <button 
                              className="btn btn-outline-primary" 
                              title="Đánh dấu đã thanh toán"
                              onClick={() => handleMarkPaid(payroll)}
                            >
                              <i className="bi bi-cash-coin"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {payrolls.length === 0 && (
                  <tr>
                    <td colSpan={(isOwner || isManager) ? 10 : 9} className="text-center py-5">
                      <div className="text-muted">
                        <i className="bi bi-inbox display-4 d-block mb-3"></i>
                        <p className="mb-2">Chưa có dữ liệu lương cho tháng này.</p>
                        <p className="small">Nhấn "Tính lương" để tạo bảng lương từ dữ liệu chấm công.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Adjustment Modal */}
      {showAdjustModal && selectedPayroll && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-coffee">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-plus-slash-minus me-2"></i>
                  Điều chỉnh lương
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAdjustModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3 p-3 bg-light rounded">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="avatar">
                      {selectedPayroll.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{selectedPayroll.userName}</strong>
                      <br />
                      <small className="text-muted">{selectedPayroll.storeName}</small>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-6">
                      <small className="text-muted">Lương gốc</small>
                      <div className="fw-bold">{formatCurrency(selectedPayroll.grossPay)}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Giờ làm</small>
                      <div className="fw-bold">{selectedPayroll.totalHours}h</div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Số tiền điều chỉnh (VNĐ)
                  </label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                    placeholder="Nhập số dương để thưởng, số âm để phạt"
                  />
                  <small className="text-muted">
                    Nhập số dương (+) để thưởng, số âm (-) để khấu trừ
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Ghi chú điều chỉnh
                  </label>
                  <textarea 
                    className="form-control" 
                    rows={3}
                    value={adjustmentNote}
                    onChange={(e) => setAdjustmentNote(e.target.value)}
                    placeholder="VD: Thưởng làm tốt / Phạt đi muộn..."
                  ></textarea>
                </div>

                <div className="alert alert-info mb-0">
                  <div className="d-flex justify-content-between">
                    <span>Lương thực lĩnh dự kiến:</span>
                    <strong className="text-primary">
                      {formatCurrency(selectedPayroll.grossPay + adjustmentAmount)}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>
                  Hủy
                </button>
                <button type="button" className="btn btn-coffee" onClick={handleSaveAdjustment}>
                  <i className="bi bi-check-lg me-2"></i>
                  Lưu điều chỉnh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPayroll && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content modal-coffee">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-receipt me-2"></i>
                  Chi tiết bảng lương
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Employee Info */}
                <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded">
                  <div className="avatar avatar-lg">
                    {selectedPayroll.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{selectedPayroll.userName}</h5>
                    <p className="mb-0 text-muted">{selectedPayroll.userEmail}</p>
                    <span className="badge bg-light text-dark mt-1">
                      <i className="bi bi-shop me-1"></i>
                      {selectedPayroll.storeName}
                    </span>
                  </div>
                  <div className="text-end">
                    <span className={`badge ${getStatusBadge(selectedPayroll.status).class} fs-6`}>
                      <i className={`${getStatusBadge(selectedPayroll.status).icon} me-1`}></i>
                      {getStatusBadge(selectedPayroll.status).label}
                    </span>
                  </div>
                </div>

                {/* Salary Details */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="text-muted mb-3">
                          <i className="bi bi-clock me-2"></i>
                          Thông tin làm việc
                        </h6>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Tháng:</span>
                          <strong>{formatMonth(selectedPayroll.month)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Tổng giờ làm:</span>
                          <strong>{selectedPayroll.totalHours} giờ</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Lương/giờ:</span>
                          <strong>{selectedPayroll.hourlyRate ? formatCurrency(selectedPayroll.hourlyRate) : '---'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h6 className="text-muted mb-3">
                          <i className="bi bi-calculator me-2"></i>
                          Chi tiết lương
                        </h6>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Lương gốc:</span>
                          <strong>{formatCurrency(selectedPayroll.grossPay)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Điều chỉnh:</span>
                          <strong className={selectedPayroll.adjustments >= 0 ? 'text-success' : 'text-danger'}>
                            {selectedPayroll.adjustments >= 0 ? '+' : ''}{formatCurrency(selectedPayroll.adjustments)}
                          </strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <span className="fw-bold">Thực lĩnh:</span>
                          <strong className="text-primary fs-5">{formatCurrency(selectedPayroll.netPay)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adjustment Note */}
                {selectedPayroll.adjustmentNote && (
                  <div className="alert alert-warning">
                    <h6 className="alert-heading">
                      <i className="bi bi-info-circle me-2"></i>
                      Ghi chú điều chỉnh
                    </h6>
                    <p className="mb-0">{selectedPayroll.adjustmentNote}</p>
                  </div>
                )}

                {/* Created At */}
                <div className="text-muted small">
                  <i className="bi bi-calendar-event me-1"></i>
                  Tạo lúc: {formatDateTime(selectedPayroll.createdAt)}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  Đóng
                </button>
                {selectedPayroll.status === 'DRAFT' && (isOwner || isManager) && (
                  <button 
                    type="button" 
                    className="btn btn-warning"
                    onClick={() => {
                      setShowDetailModal(false);
                      openAdjustModal(selectedPayroll);
                    }}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Điều chỉnh
                  </button>
                )}
                {selectedPayroll.status === 'DRAFT' && isOwner && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleApprove(selectedPayroll);
                    }}
                  >
                    <i className="bi bi-check-lg me-2"></i>
                    Duyệt lương
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        show={showConfirmModal}
        title={confirmAction === 'approve' ? 'Xác nhận duyệt lương' : 'Xác nhận thanh toán'}
        message={
          confirmAction === 'approve' 
            ? `Bạn có chắc chắn muốn duyệt bảng lương của ${selectedPayroll?.userName}? Sau khi duyệt, bạn không thể thay đổi số giờ làm và lương gốc.`
            : `Bạn có chắc chắn muốn đánh dấu đã thanh toán cho ${selectedPayroll?.userName}?`
        }
        confirmText={confirmAction === 'approve' ? 'Duyệt' : 'Xác nhận'}
        confirmButtonClass={confirmAction === 'approve' ? 'btn-success' : 'btn-primary'}
        onConfirm={confirmStatusChange}
        onCancel={() => {
          setShowConfirmModal(false);
          setSelectedPayroll(null);
          setConfirmAction(null);
        }}
      />

      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

      {/* Print Styles */}
      <style>{`
        @media print {
          .sidebar, .navbar, .btn, .modal, .toast-container {
            display: none !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 0 !important;
          }
          .card-coffee {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          .stat-card {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .table-success-light {
            background-color: #d1e7dd !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        .table-success-light {
          background-color: rgba(25, 135, 84, 0.05);
        }
        .avatar-sm {
          width: 32px;
          height: 32px;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default Payrolls;
