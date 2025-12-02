import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { setUser } from '../features/auth/authSlice';
import userService from '../api/userService';
import Toast from '../components/Toast';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
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

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      OWNER: { class: 'badge-owner', label: 'Chủ sở hữu' },
      MANAGER: { class: 'badge-manager', label: 'Quản lý' },
      STAFF: { class: 'badge-staff', label: 'Nhân viên' },
    };
    return badges[role] || { class: 'bg-secondary', label: role };
  };

  if (!user) return null;

  return (
    <div>
      <h2 className="mb-4">Hồ sơ cá nhân</h2>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card card-coffee text-center">
            <div className="card-body py-5">
              <div className="avatar avatar-lg mx-auto mb-3">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
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
                <button className="btn btn-sm btn-outline-light" onClick={() => setEditing(true)}>
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

