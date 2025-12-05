import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchRequests, createRequest, reviewRequest } from '../features/requests/requestSlice';
import { CreateRequestRequest } from '../api/requestService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { formatDateTime } from '../utils/formatters';

const Requests: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { requests, loading } = useSelector((state: RootState) => state.requests);

  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [formData, setFormData] = useState<CreateRequestRequest>({
    type: 'LEAVE',
    startDatetime: '',
    endDatetime: '',
    reason: '',
  });
  const [reviewData, setReviewData] = useState<{ status: 'APPROVED' | 'REJECTED'; note: string }>({ status: 'APPROVED', note: '' });
  const [filterStatus, setFilterStatus] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ show: false, message: '', type: 'success' });

  const isStaff = user?.role === 'STAFF';
  const canReview = user?.role === 'OWNER' || user?.role === 'MANAGER';

  useEffect(() => {
    dispatch(fetchRequests(filterStatus || undefined));
  }, [dispatch, filterStatus]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createRequest(formData)).unwrap();
      setToast({ show: true, message: 'Gửi yêu cầu thành công!', type: 'success' });
      setShowModal(false);
      setFormData({ type: 'LEAVE', startDatetime: '', endDatetime: '', reason: '' });
      // Refresh requests list after creating
      dispatch(fetchRequests(filterStatus || undefined));
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleReview = async () => {
    if (!selectedRequest) return;
    try {
      await dispatch(reviewRequest({ id: selectedRequest.id, data: reviewData })).unwrap();
      setToast({ show: true, message: 'Đã xử lý yêu cầu!', type: 'success' });
      setShowReviewModal(false);
      // Refresh requests list after review
      dispatch(fetchRequests(filterStatus || undefined));
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      PENDING: { class: 'status-pending', label: 'Chờ duyệt' },
      APPROVED: { class: 'status-approved', label: 'Đã duyệt' },
      REJECTED: { class: 'status-rejected', label: 'Từ chối' },
    };
    return badges[status] || { class: 'bg-secondary', label: status };
  };

  const getTypeBadge = (type: string) => {
    return type === 'LEAVE'
      ? { class: 'bg-info', label: 'Xin nghỉ' }
      : { class: 'bg-warning', label: 'Đổi ca' };
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Yêu cầu</h2>
          <p className="text-muted mb-0">{isStaff ? 'Yêu cầu nghỉ phép và đổi ca' : 'Quản lý yêu cầu từ nhân viên'}</p>
        </div>
        {isStaff && (
          <button className="btn btn-coffee" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-circle me-2"></i>
            Tạo yêu cầu
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="card card-coffee mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <label className="form-label mb-0">Lọc theo trạng thái:</label>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="card card-coffee">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-coffee mb-0">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Loại</th>
                  <th>Thời gian</th>
                  <th>Lý do</th>
                  <th>Trạng thái</th>
                  {canReview && <th className="text-center">Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <strong>{req.userName}</strong>
                      <br />
                      <small className="text-muted">{req.storeName}</small>
                    </td>
                    <td>
                      <span className={`badge ${getTypeBadge(req.type).class}`}>
                        {getTypeBadge(req.type).label}
                      </span>
                    </td>
                    <td>
                      <small>
                        {formatDateTime(req.startDatetime)}
                        <br />
                        đến {formatDateTime(req.endDatetime)}
                      </small>
                    </td>
                    <td><small>{req.reason || '---'}</small></td>
                    <td>
                      <span className={`badge ${getStatusBadge(req.status).class}`}>
                        {getStatusBadge(req.status).label}
                      </span>
                      {req.reviewNote && (
                        <small className="d-block text-muted mt-1">Ghi chú: {req.reviewNote}</small>
                      )}
                    </td>
                    {canReview && (
                      <td className="text-center">
                        {req.status === 'PENDING' && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => { setSelectedRequest(req); setShowReviewModal(true); }}
                          >
                            Xử lý
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={canReview ? 6 : 5} className="text-center py-4 text-muted">
                      Không có yêu cầu nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Request Modal */}
      {showModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Tạo yêu cầu mới</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleCreateRequest}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Loại yêu cầu *</label>
                      <select className="form-select" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'LEAVE' | 'SHIFT_CHANGE' })}>
                        <option value="LEAVE">Xin nghỉ phép</option>
                        <option value="SHIFT_CHANGE">Đổi ca</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thời gian bắt đầu *</label>
                      <input type="datetime-local" className="form-control" value={formData.startDatetime} onChange={(e) => setFormData({ ...formData, startDatetime: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thời gian kết thúc *</label>
                      <input type="datetime-local" className="form-control" value={formData.endDatetime} onChange={(e) => setFormData({ ...formData, endDatetime: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Lý do</label>
                      <textarea className="form-control" rows={3} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Nhập lý do yêu cầu..."></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                    <button type="submit" className="btn btn-coffee">Gửi yêu cầu</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Xử lý yêu cầu</h5>
                  <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>Nhân viên:</strong> {selectedRequest.userName}</p>
                  <p><strong>Loại:</strong> {getTypeBadge(selectedRequest.type).label}</p>
                  <p><strong>Thời gian:</strong> {formatDateTime(selectedRequest.startDatetime)} - {formatDateTime(selectedRequest.endDatetime)}</p>
                  <p><strong>Lý do:</strong> {selectedRequest.reason || '---'}</p>
                  <hr />
                  <div className="mb-3">
                    <label className="form-label">Quyết định *</label>
                    <select className="form-select" value={reviewData.status} onChange={(e) => setReviewData({ ...reviewData, status: e.target.value as 'APPROVED' | 'REJECTED' })}>
                      <option value="APPROVED">Duyệt</option>
                      <option value="REJECTED">Từ chối</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ghi chú</label>
                    <textarea className="form-control" rows={2} value={reviewData.note} onChange={(e) => setReviewData({ ...reviewData, note: e.target.value })} placeholder="Ghi chú cho nhân viên..."></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Hủy</button>
                  <button type="button" className={`btn ${reviewData.status === 'APPROVED' ? 'btn-success' : 'btn-danger'}`} onClick={handleReview}>
                    {reviewData.status === 'APPROVED' ? 'Duyệt' : 'Từ chối'}
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

export default Requests;

