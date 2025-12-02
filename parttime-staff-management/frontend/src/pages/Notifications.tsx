import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchNotifications, markAsRead, markAllAsRead } from '../features/notifications/notificationSlice';
import { fetchStores } from '../features/stores/storeSlice';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { formatDateTime } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Notifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications, loading } = useSelector((state: RootState) => state.notifications);
  const { stores } = useSelector((state: RootState) => state.stores);
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendData, setSendData] = useState({
    title: '',
    message: '',
    link: '',
    storeId: undefined as number | undefined,
    targetRole: '' as string,
  });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ 
    show: false, message: '', type: 'success' 
  });

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const isOwner = user?.role === 'OWNER';
  const isManager = user?.role === 'MANAGER';
  const canSendNotification = isOwner || isManager;

  useEffect(() => {
    dispatch(fetchNotifications());
    if (canSendNotification) {
      dispatch(fetchStores());
    }
  }, [dispatch, canSendNotification]);

  const handleClick = async (notification: any) => {
    if (!notification.isRead) {
      await dispatch(markAsRead(notification.id));
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    await dispatch(markAllAsRead());
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await api.post('/notifications/broadcast', {
        title: sendData.title,
        message: sendData.message,
        link: sendData.link || null,
        storeId: sendData.storeId || null,
        targetRole: sendData.targetRole || null,
      });
      const sentCount = (response.data as any)?.data?.sentCount || 0;
      setToast({ show: true, message: `Đã gửi thông báo đến ${sentCount} người!`, type: 'success' });
      setShowSendModal(false);
      setSendData({ title: '', message: '', link: '', storeId: undefined, targetRole: '' });
    } catch (err: any) {
      setToast({ show: true, message: err.response?.data?.message || 'Có lỗi xảy ra!', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? safeNotifications.filter(n => !n.isRead) 
    : safeNotifications;

  if (loading && safeNotifications.length === 0) {
    return <Loading />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-bell me-2"></i>
            Thông báo
          </h2>
          <p className="text-muted mb-0">Tất cả thông báo của bạn</p>
        </div>
        <div className="d-flex gap-2">
          {canSendNotification && (
            <button className="btn btn-coffee" onClick={() => setShowSendModal(true)}>
              <i className="bi bi-send me-2"></i>
              Gửi thông báo
            </button>
          )}
          {safeNotifications.some(n => !n.isRead) && (
            <button className="btn btn-outline-coffee" onClick={handleMarkAllRead}>
              <i className="bi bi-check-all me-2"></i>
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="card card-coffee mb-4">
        <div className="card-body">
          <div className="btn-group">
            <button 
              className={`btn ${filter === 'all' ? 'btn-coffee' : 'btn-outline-coffee'}`}
              onClick={() => setFilter('all')}
            >
              Tất cả ({safeNotifications.length})
            </button>
            <button 
              className={`btn ${filter === 'unread' ? 'btn-coffee' : 'btn-outline-coffee'}`}
              onClick={() => setFilter('unread')}
            >
              Chưa đọc ({safeNotifications.filter(n => !n.isRead).length})
            </button>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="card card-coffee">
        <div className="list-group list-group-flush">
          {filteredNotifications.map((notification) => (
            <button
              key={notification.id}
              className={`list-group-item list-group-item-action d-flex align-items-start ${!notification.isRead ? 'bg-light' : ''}`}
              onClick={() => handleClick(notification)}
              style={{ textAlign: 'left' }}
            >
              <div className={`me-3 mt-1 ${!notification.isRead ? 'text-primary' : 'text-muted'}`}>
                <i className={`bi ${notification.isRead ? 'bi-bell' : 'bi-bell-fill'} fs-4`}></i>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <h6 className={`mb-1 ${!notification.isRead ? 'fw-bold' : ''}`}>
                    {notification.title}
                  </h6>
                  <small className="text-muted">
                    {formatDateTime(notification.createdAt)}
                  </small>
                </div>
                <p className="mb-1 text-muted small">{notification.message}</p>
                {notification.link && (
                  <small className="text-primary">
                    <i className="bi bi-link-45deg me-1"></i>
                    Xem chi tiết
                  </small>
                )}
              </div>
              {!notification.isRead && (
                <span className="badge bg-primary rounded-pill ms-2">Mới</span>
              )}
            </button>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-bell-slash fs-1 d-block mb-3"></i>
              <p>Không có thông báo nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-send me-2"></i>
                    Gửi thông báo
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowSendModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSendNotification}>
                  <div className="modal-body">
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      {isOwner 
                        ? 'Bạn có thể gửi thông báo đến tất cả nhân viên hoặc chọn theo cơ sở.'
                        : 'Bạn có thể gửi thông báo đến nhân viên trong cơ sở của mình.'}
                    </div>

                    <div className="row g-3">
                      {isOwner && (
                        <div className="col-md-6">
                          <label className="form-label">Gửi đến cơ sở</label>
                          <select
                            className="form-select"
                            value={sendData.storeId || ''}
                            onChange={(e) => setSendData({ ...sendData, storeId: e.target.value ? Number(e.target.value) : undefined })}
                          >
                            <option value="">Tất cả cơ sở</option>
                            {stores.map((store) => (
                              <option key={store.id} value={store.id}>
                                {store.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className={isOwner ? 'col-md-6' : 'col-12'}>
                        <label className="form-label">Đối tượng</label>
                        <select
                          className="form-select"
                          value={sendData.targetRole}
                          onChange={(e) => setSendData({ ...sendData, targetRole: e.target.value })}
                        >
                          <option value="">Tất cả</option>
                          <option value="STAFF">Chỉ nhân viên</option>
                          {isOwner && <option value="MANAGER">Chỉ quản lý</option>}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Tiêu đề *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={sendData.title}
                          onChange={(e) => setSendData({ ...sendData, title: e.target.value })}
                          placeholder="Nhập tiêu đề thông báo"
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Nội dung *</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          value={sendData.message}
                          onChange={(e) => setSendData({ ...sendData, message: e.target.value })}
                          placeholder="Nhập nội dung thông báo..."
                          required
                        ></textarea>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Link (tùy chọn)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={sendData.link}
                          onChange={(e) => setSendData({ ...sendData, link: e.target.value })}
                          placeholder="VD: /shifts hoặc /requests"
                        />
                        <small className="text-muted">
                          Đường dẫn trong hệ thống để người nhận có thể click vào
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowSendModal(false)}
                      disabled={sending}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-coffee" disabled={sending}>
                      {sending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Gửi thông báo
                        </>
                      )}
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

export default Notifications;
