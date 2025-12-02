import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchStores } from '../features/stores/storeSlice';
import {
  createComplaint,
  fetchMyComplaints,
  fetchComplaintsByStore,
  fetchAllComplaints,
  fetchPendingComplaints,
  respondToComplaint,
} from '../features/complaints/complaintSlice';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { formatDateTime } from '../utils/formatters';
import { Complaint, ComplaintType, ComplaintStatus } from '../api/complaintService';

const Complaints: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stores } = useSelector((state: RootState) => state.stores);
  const { complaints, myComplaints, pendingComplaints, loading } = useSelector(
    (state: RootState) => state.complaints
  );

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'my'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'OTHER' as ComplaintType,
    subject: '',
    content: '',
  });
  const [responseData, setResponseData] = useState({
    status: 'RESOLVED' as ComplaintStatus,
    response: '',
  });
  
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ 
    show: false, message: '', type: 'success' 
  });

  const isStaff = user?.role === 'STAFF';
  const isManager = user?.role === 'MANAGER';
  const isOwner = user?.role === 'OWNER';

  // Ensure arrays are always valid
  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const safeMyComplaints = Array.isArray(myComplaints) ? myComplaints : [];
  const safePendingComplaints = Array.isArray(pendingComplaints) ? pendingComplaints : [];

  useEffect(() => {
    dispatch(fetchStores());
    if (isStaff) {
      dispatch(fetchMyComplaints());
      setActiveTab('my');
    }
  }, [dispatch, isStaff]);

  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId && !isStaff) {
      const defaultStore = user?.storeId || stores[0].id;
      setSelectedStoreId(defaultStore);
    }
  }, [stores, user?.storeId, selectedStoreId, isStaff]);

  useEffect(() => {
    if (!isStaff && selectedStoreId) {
      if (isOwner) {
        dispatch(fetchAllComplaints());
      } else {
        dispatch(fetchComplaintsByStore(selectedStoreId));
      }
      dispatch(fetchPendingComplaints(selectedStoreId));
    }
  }, [dispatch, selectedStoreId, isStaff, isOwner]);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createComplaint(formData)).unwrap();
      setToast({ show: true, message: 'Gửi khiếu nại thành công!', type: 'success' });
      setShowCreateModal(false);
      setFormData({ type: 'OTHER', subject: '', content: '' });
      dispatch(fetchMyComplaints());
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleRespondComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await dispatch(respondToComplaint({ id: selectedComplaint.id, data: responseData })).unwrap();
      setToast({ show: true, message: 'Đã phản hồi khiếu nại!', type: 'success' });
      setShowRespondModal(false);
      setSelectedComplaint(null);
      setResponseData({ status: 'RESOLVED', response: '' });
      if (selectedStoreId) {
        dispatch(fetchPendingComplaints(selectedStoreId));
        if (isOwner) {
          dispatch(fetchAllComplaints());
        } else {
          dispatch(fetchComplaintsByStore(selectedStoreId));
        }
      }
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const getTypeBadge = (type: ComplaintType) => {
    const types: Record<ComplaintType, { class: string; label: string }> = {
      SALARY: { class: 'bg-warning text-dark', label: 'Lương' },
      SCHEDULE: { class: 'bg-info', label: 'Lịch làm' },
      WORKPLACE: { class: 'bg-secondary', label: 'Môi trường' },
      COLLEAGUE: { class: 'bg-primary', label: 'Đồng nghiệp' },
      MANAGEMENT: { class: 'bg-danger', label: 'Quản lý' },
      OTHER: { class: 'bg-dark', label: 'Khác' },
    };
    return types[type] || types.OTHER;
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    const statuses: Record<ComplaintStatus, { class: string; label: string }> = {
      PENDING: { class: 'bg-warning text-dark', label: 'Chờ xử lý' },
      IN_PROGRESS: { class: 'bg-info', label: 'Đang xử lý' },
      RESOLVED: { class: 'bg-success', label: 'Đã giải quyết' },
      REJECTED: { class: 'bg-danger', label: 'Từ chối' },
      CLOSED: { class: 'bg-secondary', label: 'Đã đóng' },
    };
    return statuses[status] || statuses.PENDING;
  };

  const displayComplaints = activeTab === 'my' ? safeMyComplaints : 
                           activeTab === 'pending' ? safePendingComplaints : 
                           safeComplaints;

  if (loading && displayComplaints.length === 0) {
    return <Loading />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {isStaff ? 'Khiếu nại của tôi' : 'Quản lý khiếu nại'}
          </h2>
          <p className="text-muted mb-0">
            {isStaff ? 'Gửi và theo dõi khiếu nại' : 'Xem và phản hồi khiếu nại từ nhân viên'}
          </p>
        </div>
        {isStaff && (
          <button className="btn btn-coffee" onClick={() => setShowCreateModal(true)}>
            <i className="bi bi-plus-circle me-2"></i>
            Gửi khiếu nại
          </button>
        )}
      </div>

      {/* Store Filter (Manager/Owner) */}
      {!isStaff && (isOwner || stores.length > 1) && (
        <div className="card card-coffee mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-auto">
                <label className="form-label mb-0">Chọn cơ sở:</label>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={selectedStoreId || ''}
                  onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                  disabled={isManager}
                >
                  {isOwner && <option value="">Tất cả cơ sở</option>}
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {!isStaff && (
          <>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <i className="bi bi-list me-1"></i>
                Tất cả ({safeComplaints.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                <i className="bi bi-clock me-1"></i>
                Chờ xử lý
                {safePendingComplaints.length > 0 && (
                  <span className="badge bg-danger ms-1">{safePendingComplaints.length}</span>
                )}
              </button>
            </li>
          </>
        )}
        {isStaff && (
          <li className="nav-item">
            <button className={`nav-link active`}>
              <i className="bi bi-person me-1"></i>
              Khiếu nại của tôi ({safeMyComplaints.length})
            </button>
          </li>
        )}
      </ul>

      {/* Complaints List */}
      <div className="row g-3">
        {displayComplaints.map((complaint) => (
          <div key={complaint.id} className="col-md-6 col-lg-4">
            <div className="card card-coffee h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title mb-0">{complaint.subject}</h5>
                  <span className={`badge ${getStatusBadge(complaint.status).class}`}>
                    {getStatusBadge(complaint.status).label}
                  </span>
                </div>
                
                <div className="mb-2">
                  <span className={`badge ${getTypeBadge(complaint.type).class} me-2`}>
                    {getTypeBadge(complaint.type).label}
                  </span>
                </div>

                <p className="small text-muted mb-2">
                  <i className="bi bi-person me-1"></i>
                  {complaint.fromUserName}
                </p>
                
                {!isStaff && (
                  <p className="small text-muted mb-2">
                    <i className="bi bi-shop me-1"></i>
                    {complaint.storeName}
                  </p>
                )}

                <p className="small text-muted mb-2">
                  <i className="bi bi-calendar me-1"></i>
                  {formatDateTime(complaint.createdAt)}
                </p>

                <p className="small mb-3" style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical' as any
                }}>
                  {complaint.content}
                </p>

                {complaint.response && (
                  <div className="alert alert-info py-2 mb-2">
                    <small>
                      <strong>Phản hồi:</strong> {complaint.response}
                    </small>
                  </div>
                )}

                {!isStaff && complaint.status === 'PENDING' && (
                  <button
                    className="btn btn-coffee btn-sm w-100"
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setShowRespondModal(true);
                    }}
                  >
                    <i className="bi bi-reply me-1"></i>
                    Phản hồi
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {displayComplaints.length === 0 && (
          <div className="col-12 text-center py-5 text-muted">
            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
            <p>Không có khiếu nại nào</p>
          </div>
        )}
      </div>

      {/* Create Complaint Modal */}
      {showCreateModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Gửi khiếu nại</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleCreateComplaint}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Loại khiếu nại *</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as ComplaintType })}
                      >
                        <option value="SALARY">Về lương</option>
                        <option value="SCHEDULE">Về lịch làm việc</option>
                        <option value="WORKPLACE">Về môi trường làm việc</option>
                        <option value="COLLEAGUE">Về đồng nghiệp</option>
                        <option value="MANAGEMENT">Về quản lý</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Tiêu đề *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Nhập tiêu đề khiếu nại"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Nội dung chi tiết *</label>
                      <textarea
                        className="form-control"
                        rows={5}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-coffee">
                      Gửi khiếu nại
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {/* Respond Modal */}
      {showRespondModal && selectedComplaint && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Phản hồi khiếu nại</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowRespondModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleRespondComplaint}>
                  <div className="modal-body">
                    <div className="alert alert-light mb-3">
                      <strong>Tiêu đề:</strong> {selectedComplaint.subject}
                      <br />
                      <strong>Nội dung:</strong> {selectedComplaint.content}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Trạng thái *</label>
                      <select
                        className="form-select"
                        value={responseData.status}
                        onChange={(e) => setResponseData({ ...responseData, status: e.target.value as ComplaintStatus })}
                      >
                        <option value="IN_PROGRESS">Đang xử lý</option>
                        <option value="RESOLVED">Đã giải quyết</option>
                        <option value="REJECTED">Từ chối</option>
                        <option value="CLOSED">Đóng</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phản hồi *</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={responseData.response}
                        onChange={(e) => setResponseData({ ...responseData, response: e.target.value })}
                        placeholder="Nhập phản hồi cho nhân viên..."
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowRespondModal(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-coffee">
                      Gửi phản hồi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default Complaints;



