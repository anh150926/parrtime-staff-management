import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchStores, createStore, updateStore, deleteStore } from '../features/stores/storeSlice';
import { fetchUsers } from '../features/users/userSlice';
import { CreateStoreRequest, UpdateStoreRequest } from '../api/storeService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const Stores: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stores, loading, error } = useSelector((state: RootState) => state.stores);
  const { users } = useSelector((state: RootState) => state.users);

  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [formData, setFormData] = useState<CreateStoreRequest>({
    name: '',
    address: '',
    openingTime: '07:00',
    closingTime: '22:00',
    managerId: undefined,
  });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const managers = users.filter((u) => u.role === 'MANAGER');

  useEffect(() => {
    dispatch(fetchStores());
    dispatch(fetchUsers());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      openingTime: '07:00',
      closingTime: '22:00',
      managerId: undefined,
    });
    setEditingStore(null);
  };

  const handleOpenModal = (store?: any) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name,
        address: store.address,
        openingTime: store.openingTime || '07:00',
        closingTime: store.closingTime || '22:00',
        managerId: store.managerId,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStore) {
        const updateData: UpdateStoreRequest = {
          name: formData.name,
          address: formData.address,
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
          managerId: formData.managerId,
        };
        await dispatch(updateStore({ id: editingStore.id, data: updateData })).unwrap();
        setToast({ show: true, message: 'Cập nhật cơ sở thành công!', type: 'success' });
      } else {
        await dispatch(createStore(formData)).unwrap();
        setToast({ show: true, message: 'Thêm cơ sở thành công!', type: 'success' });
      }
      handleCloseModal();
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteStore(id)).unwrap();
      setToast({ show: true, message: 'Xóa cơ sở thành công!', type: 'success' });
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
    setConfirmDelete(null);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý cơ sở</h2>
          <p className="text-muted mb-0">Danh sách các cơ sở cà phê</p>
        </div>
        <button className="btn btn-coffee" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm cơ sở
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4">
        {stores.map((store) => (
          <div key={store.id} className="col-md-6 col-lg-4">
            <div className="card card-coffee h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>
                  <i className="bi bi-shop me-2"></i>
                  {store.name}
                </span>
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-link text-white"
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleOpenModal(store)}
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Chỉnh sửa
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => setConfirmDelete(store.id)}
                      >
                        <i className="bi bi-trash me-2"></i>
                        Xóa
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body">
                <p className="mb-2">
                  <i className="bi bi-geo-alt me-2 text-muted"></i>
                  {store.address}
                </p>
                <p className="mb-2">
                  <i className="bi bi-clock me-2 text-muted"></i>
                  {store.openingTime || '---'} - {store.closingTime || '---'}
                </p>
                <p className="mb-2">
                  <i className="bi bi-person-badge me-2 text-muted"></i>
                  Quản lý: {store.managerName || 'Chưa phân công'}
                </p>
                <p className="mb-0">
                  <i className="bi bi-people me-2 text-muted"></i>
                  <span className="badge bg-primary">{store.staffCount} nhân viên</span>
                </p>
              </div>
            </div>
          </div>
        ))}

        {stores.length === 0 && (
          <div className="col-12">
            <div className="text-center py-5 text-muted">
              <i className="bi bi-shop fs-1 d-block mb-3"></i>
              <p>Chưa có cơ sở nào. Hãy thêm cơ sở đầu tiên!</p>
            </div>
          </div>
        )}
      </div>

      {/* Store Modal */}
      {showModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingStore ? 'Cập nhật cơ sở' : 'Thêm cơ sở mới'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Tên cơ sở *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Địa chỉ *</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                      ></textarea>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label">Giờ mở cửa</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.openingTime}
                          onChange={(e) =>
                            setFormData({ ...formData, openingTime: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label">Giờ đóng cửa</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.closingTime}
                          onChange={(e) =>
                            setFormData({ ...formData, closingTime: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Quản lý</label>
                      <select
                        className="form-select"
                        value={formData.managerId || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            managerId: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      >
                        <option value="">-- Chọn quản lý --</option>
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-coffee">
                      {editingStore ? 'Cập nhật' : 'Thêm mới'}
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

      <ConfirmModal
        show={confirmDelete !== null}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa cơ sở này? Tất cả nhân viên cần được chuyển sang cơ sở khác trước."
        confirmText="Xóa"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Stores;

