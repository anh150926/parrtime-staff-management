import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchStores } from '../features/stores/storeSlice';
import Toast from '../components/Toast';
import api from '../api/axios';

const SendNotification: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stores } = useSelector((state: RootState) => state.stores);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sendData, setSendData] = useState({
    title: '',
    message: '',
    attachmentUrl: '',
    attachmentName: '',
    storeId: undefined as number | undefined,
    targetRole: '' as string,
  });
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ 
    show: false, message: '', type: 'success' 
  });

  useEffect(() => {
    dispatch(fetchStores());
  }, [dispatch]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ show: true, message: 'Tệp không được vượt quá 5MB!', type: 'error' });
      return;
    }

    setUploadingFile(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setSendData({ 
          ...sendData, 
          attachmentUrl: base64String,
          attachmentName: file.name 
        });
        setUploadingFile(false);
      };
      reader.onerror = () => {
        setToast({ show: true, message: 'Không thể đọc tệp!', type: 'error' });
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setToast({ show: true, message: 'Có lỗi xảy ra khi xử lý tệp!', type: 'error' });
      setUploadingFile(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    setSendData({ ...sendData, attachmentUrl: '', attachmentName: '' });
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'bi-file-image';
    if (['pdf'].includes(ext || '')) return 'bi-file-pdf';
    if (['doc', 'docx'].includes(ext || '')) return 'bi-file-word';
    if (['xls', 'xlsx'].includes(ext || '')) return 'bi-file-excel';
    if (['ppt', 'pptx'].includes(ext || '')) return 'bi-file-ppt';
    if (['zip', 'rar', '7z'].includes(ext || '')) return 'bi-file-zip';
    return 'bi-file-earmark';
  };

  const isImageFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await api.post('/notifications/broadcast', {
        title: sendData.title,
        message: sendData.message,
        link: null,
        attachmentUrl: sendData.attachmentUrl || null,
        attachmentName: sendData.attachmentName || null,
        storeId: sendData.storeId || null,
        targetRole: sendData.targetRole || null,
      });
      const sentCount = (response.data as any)?.data?.sentCount || 0;
      setToast({ show: true, message: `Đã gửi thông báo đến ${sentCount} người!`, type: 'success' });
      // Reset form
      setSendData({ title: '', message: '', attachmentUrl: '', attachmentName: '', storeId: undefined, targetRole: '' });
    } catch (err: any) {
      setToast({ show: true, message: err.response?.data?.message || 'Có lỗi xảy ra!', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-send me-2"></i>
            Gửi thông báo
          </h2>
          <p className="text-muted mb-0">Gửi thông báo đến nhân viên trong hệ thống</p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card card-coffee">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-envelope-paper me-2"></i>
                Soạn thông báo mới
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSendNotification}>
                <div className="alert alert-info mb-4">
                  <i className="bi bi-info-circle me-2"></i>
                  Bạn có thể gửi thông báo đến tất cả nhân viên hoặc chọn theo cơ sở và vai trò.
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="bi bi-shop me-1"></i>
                      Gửi đến cơ sở
                    </label>
                    <div className="position-relative">
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
                      <i className="bi bi-chevron-down position-absolute top-50 end-0 translate-middle-y me-3" style={{ pointerEvents: 'none', zIndex: 10 }}></i>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="bi bi-people me-1"></i>
                      Đối tượng
                    </label>
                    <div className="position-relative">
                      <select
                        className="form-select"
                        value={sendData.targetRole}
                        onChange={(e) => setSendData({ ...sendData, targetRole: e.target.value })}
                      >
                        <option value="">Tất cả</option>
                        <option value="STAFF">Chỉ nhân viên</option>
                        <option value="MANAGER">Chỉ quản lý</option>
                      </select>
                      <i className="bi bi-chevron-down position-absolute top-50 end-0 translate-middle-y me-3" style={{ pointerEvents: 'none', zIndex: 10 }}></i>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      <i className="bi bi-type me-1"></i>
                      Tiêu đề *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={sendData.title}
                      onChange={(e) => setSendData({ ...sendData, title: e.target.value })}
                      placeholder="Nhập tiêu đề thông báo"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      <i className="bi bi-text-paragraph me-1"></i>
                      Nội dung *
                    </label>
                    <textarea
                      className="form-control"
                      rows={6}
                      value={sendData.message}
                      onChange={(e) => setSendData({ ...sendData, message: e.target.value })}
                      placeholder="Nhập nội dung thông báo chi tiết..."
                      required
                    ></textarea>
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      <i className="bi bi-paperclip me-1"></i>
                      Đính kèm tệp (tùy chọn)
                    </label>
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                    />
                    
                    {!sendData.attachmentUrl ? (
                      <div 
                        className="border border-2 border-dashed rounded p-4 text-center"
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: '#f8f9fa',
                          borderColor: '#dee2e6',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={handleFileSelect}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#6c757d';
                          e.currentTarget.style.backgroundColor = '#e9ecef';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#dee2e6';
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }}
                      >
                        {uploadingFile ? (
                          <div>
                            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mb-0 text-muted">Đang tải tệp...</p>
                          </div>
                        ) : (
                          <div>
                            <i className="bi bi-cloud-upload fs-1 text-muted"></i>
                            <p className="mb-1 mt-2">Click để chọn tệp hoặc kéo thả vào đây</p>
                            <small className="text-muted">
                              Hỗ trợ: Ảnh, PDF, Word, Excel, PowerPoint, ZIP (Tối đa 5MB)
                            </small>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border rounded p-3 d-flex align-items-center justify-content-between bg-light">
                        <div className="d-flex align-items-center gap-3">
                          {isImageFile(sendData.attachmentName) ? (
                            <img 
                              src={sendData.attachmentUrl} 
                              alt="Preview"
                              style={{ 
                                width: '60px', 
                                height: '60px', 
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          ) : (
                            <i className={`${getFileIcon(sendData.attachmentName)} fs-1 text-primary`}></i>
                          )}
                          <div>
                            <strong>{sendData.attachmentName}</strong>
                            <br />
                            <small className="text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Đã chọn tệp
                            </small>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={handleFileSelect}
                            title="Thay đổi tệp"
                          >
                            <i className="bi bi-arrow-repeat"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={removeAttachment}
                            title="Xóa tệp"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-12 mt-4">
                    <hr />
                    <div className="d-flex justify-content-end gap-2">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setSendData({ title: '', message: '', attachmentUrl: '', attachmentName: '', storeId: undefined, targetRole: '' })}
                        disabled={sending}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Xóa nội dung
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-coffee btn-lg px-4" 
                        disabled={sending || uploadingFile}
                      >
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
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card card-coffee">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-lightbulb me-2"></i>
                Hướng dẫn
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6 className="text-muted small text-uppercase">Chọn đối tượng</h6>
                <p className="small mb-0">
                  Bạn có thể gửi thông báo đến:
                </p>
                <ul className="small mb-0 ps-3">
                  <li>Tất cả nhân viên trong hệ thống</li>
                  <li>Nhân viên theo từng cơ sở</li>
                  <li>Chỉ Quản lý hoặc chỉ Nhân viên</li>
                </ul>
              </div>

              <div className="mb-3">
                <h6 className="text-muted small text-uppercase">Đính kèm tệp</h6>
                <p className="small mb-0">
                  Hỗ trợ các định dạng: ảnh (JPG, PNG, GIF), tài liệu (PDF, Word, Excel, PowerPoint) và file nén (ZIP, RAR).
                </p>
              </div>

              <div className="mb-0">
                <h6 className="text-muted small text-uppercase">Lưu ý</h6>
                <p className="small mb-0">
                  Thông báo sẽ được gửi ngay lập tức và hiển thị trong mục "Thông báo" của người nhận.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default SendNotification;