import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { setUser } from '../features/auth/authSlice';
import userService from '../api/userService';
import Toast from '../components/Toast';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ show: false, message: '', type: 'success' });

  const handleSave = async () => {
    if (!user) return;
    try {
      const response = await userService.update(user.id, formData);
      dispatch(setUser(response.data));
      setToast({ show: true, message: 'Cập nhật thành công!', type: 'success' });
      setEditing(false);
    } catch (error: any) {
      setToast({ show: true, message: error.response?.data?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({ show: true, message: 'Vui lòng chọn file ảnh!', type: 'error' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setToast({ show: true, message: 'Ảnh không được vượt quá 2MB!', type: 'error' });
      return;
    }

    setUploadingAvatar(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        
        // Resize image if needed (max 400x400 pixels)
        const resizedImage = await resizeImage(base64String, 400, 400);
        
        setAvatarPreview(resizedImage);
        
        // Save to server
        try {
          const response = await userService.update(user.id, { avatarUrl: resizedImage });
          dispatch(setUser(response.data));
          setToast({ show: true, message: 'Cập nhật avatar thành công!', type: 'success' });
        } catch (error: any) {
          setAvatarPreview(null);
          setToast({ show: true, message: error.response?.data?.message || 'Không thể cập nhật avatar!', type: 'error' });
        }
        setUploadingAvatar(false);
      };
      reader.onerror = () => {
        setToast({ show: true, message: 'Không thể đọc file ảnh!', type: 'error' });
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setToast({ show: true, message: 'Có lỗi xảy ra khi xử lý ảnh!', type: 'error' });
      setUploadingAvatar(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resizeImage = (base64: string, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = base64;
    });
  };

  const removeAvatar = async () => {
    if (!user) return;
    
    setUploadingAvatar(true);
    try {
      const response = await userService.update(user.id, { avatarUrl: '' });
      dispatch(setUser(response.data));
      setAvatarPreview(null);
      setToast({ show: true, message: 'Đã xóa avatar!', type: 'success' });
    } catch (error: any) {
      setToast({ show: true, message: error.response?.data?.message || 'Không thể xóa avatar!', type: 'error' });
    }
    setUploadingAvatar(false);
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      OWNER: { class: 'badge-owner', label: 'Chủ sở hữu' },
      MANAGER: { class: 'badge-manager', label: 'Quản lý' },
      STAFF: { class: 'badge-staff', label: 'Nhân viên' },
    };
    return badges[role] || { class: 'bg-secondary', label: role };
  };

  const currentAvatar = avatarPreview || user?.avatarUrl;

  if (!user) return null;

  return (
    <div>
      <h2 className="mb-4">Hồ sơ cá nhân</h2>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card card-coffee text-center">
            <div className="card-body py-5">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              
              {/* Avatar with click to upload */}
              <div 
                className="avatar-container mx-auto mb-3"
                style={{ 
                  position: 'relative', 
                  width: '100px', 
                  height: '100px',
                  cursor: 'pointer'
                }}
                onClick={handleAvatarClick}
                title="Click để thay đổi avatar"
              >
                {currentAvatar ? (
                  <img 
                    src={currentAvatar} 
                    alt="Avatar"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid var(--coffee-accent)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  />
                ) : (
                  <div 
                    className="avatar avatar-lg"
                    style={{
                      width: '100px',
                      height: '100px',
                      fontSize: '2.5rem',
                      border: '4px solid var(--coffee-accent)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Upload overlay */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    top: 0,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: uploadingAvatar ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}
                  className="avatar-overlay"
                >
                  {uploadingAvatar ? (
                    <div className="spinner-border spinner-border-sm text-white" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <i className="bi bi-camera-fill text-white" style={{ fontSize: '1.5rem' }}></i>
                  )}
                </div>
                
                {/* Hover overlay */}
                <style>{`
                  .avatar-container:hover .avatar-overlay {
                    opacity: 1 !important;
                  }
                `}</style>
              </div>
              
              {/* Avatar action buttons */}
              <div className="mb-3">
                <button 
                  className="btn btn-sm btn-outline-coffee me-2"
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                >
                  <i className="bi bi-camera me-1"></i>
                  Đổi ảnh
                </button>
                {currentAvatar && (
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={removeAvatar}
                    disabled={uploadingAvatar}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Xóa
                  </button>
                )}
              </div>
              
              <small className="text-muted d-block mb-3">
                <i className="bi bi-info-circle me-1"></i>
                Click vào ảnh hoặc nút "Đổi ảnh" để thay avatar
                <br/>
                (Hỗ trợ: JPG, PNG, GIF - Tối đa 2MB)
              </small>

              <h4>{user.fullName}</h4>
              <span className={`badge ${getRoleBadge(user.role).class}`}>
                {getRoleBadge(user.role).label}
              </span>
              {user.storeName && (
                <p className="mt-3 mb-0 text-muted">
                  <i className="bi bi-shop me-2"></i>
                  {user.storeName}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card card-coffee">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-person me-2"></i>
                Thông tin cá nhân
              </span>
              {!editing && (
                <button className="btn btn-sm btn-outline-coffee" onClick={() => setEditing(true)}>
                  <i className="bi bi-pencil me-1"></i>
                  Chỉnh sửa
                </button>
              )}
            </div>
            <div className="card-body">
              {editing ? (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Họ và tên</label>
                    <input type="text" className="form-control" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Số điện thoại</label>
                    <input type="tel" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-coffee" onClick={handleSave}>Lưu thay đổi</button>
                    <button className="btn btn-secondary" onClick={() => setEditing(false)}>Hủy</button>
                  </div>
                </div>
              ) : (
                <table className="table table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted" width="30%">Tên đăng nhập:</td>
                      <td>@{user.username}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Họ và tên:</td>
                      <td>{user.fullName}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Email:</td>
                      <td>{user.email}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Số điện thoại:</td>
                      <td>{user.phone || '---'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Lương/giờ:</td>
                      <td>{user.hourlyRate ? formatCurrency(user.hourlyRate) : '---'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Ngày tạo:</td>
                      <td>{formatDateTime(user.createdAt)}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
};

export default Profile;
