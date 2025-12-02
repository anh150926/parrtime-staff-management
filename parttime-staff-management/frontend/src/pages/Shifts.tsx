import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchShiftsByStore, createShift, deleteShift, assignStaffToShift } from '../features/shifts/shiftSlice';
import { fetchStores } from '../features/stores/storeSlice';
import { fetchUsers } from '../features/users/userSlice';
import { CreateShiftRequest } from '../api/shiftService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { formatDateTime, formatTime } from '../utils/formatters';

const Shifts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { shifts, loading } = useSelector((state: RootState) => state.shifts);
  const { stores } = useSelector((state: RootState) => state.stores);
  const { users } = useSelector((state: RootState) => state.users);

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [formData, setFormData] = useState<CreateShiftRequest>({
    title: '',
    startDatetime: '',
    endDatetime: '',
    requiredSlots: 1,
  });
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchStores());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    // Set default store
    if (stores.length > 0 && !selectedStoreId) {
      const defaultStore = currentUser?.storeId || stores[0].id;
      setSelectedStoreId(defaultStore);
    }
  }, [stores, currentUser?.storeId, selectedStoreId]);

  useEffect(() => {
    if (selectedStoreId) {
      dispatch(fetchShiftsByStore({ storeId: selectedStoreId }));
    }
  }, [dispatch, selectedStoreId]);

  const storeStaff = users.filter(
    (u) => u.role === 'STAFF' && u.storeId === selectedStoreId
  );

  const handleOpenModal = () => {
    setFormData({
      title: '',
      startDatetime: '',
      endDatetime: '',
      requiredSlots: 1,
    });
    setShowModal(true);
  };

  const handleOpenAssignModal = (shift: any) => {
    setSelectedShift(shift);
    const assignedIds = shift.assignments?.map((a: any) => a.userId) || [];
    setSelectedUserIds(assignedIds);
    setShowAssignModal(true);
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId) return;
    
    try {
      await dispatch(createShift({ storeId: selectedStoreId, data: formData })).unwrap();
      setToast({ show: true, message: 'Tạo ca làm thành công!', type: 'success' });
      setShowModal(false);
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedShift) return;
    
    try {
      await dispatch(
        assignStaffToShift({ shiftId: selectedShift.id, data: { userIds: selectedUserIds } })
      ).unwrap();
      setToast({ show: true, message: 'Phân công nhân viên thành công!', type: 'success' });
      setShowAssignModal(false);
      // Refresh shifts
      if (selectedStoreId) {
        dispatch(fetchShiftsByStore({ storeId: selectedStoreId }));
      }
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteShift(id)).unwrap();
      setToast({ show: true, message: 'Xóa ca làm thành công!', type: 'success' });
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
    setConfirmDelete(null);
  };

  const getAssignmentStatus = (shift: any) => {
    const confirmed = shift.confirmedCount || 0;
    const required = shift.requiredSlots || 1;
    if (confirmed >= required) return 'success';
    if (confirmed > 0) return 'warning';
    return 'secondary';
  };

  if (loading && shifts.length === 0) {
    return <Loading />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Lịch làm việc</h2>
          <p className="text-muted mb-0">Quản lý ca làm việc tại cơ sở</p>
        </div>
        <button className="btn btn-coffee" onClick={handleOpenModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Tạo ca mới
        </button>
      </div>

      {/* Store Filter */}
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
                disabled={currentUser?.role === 'MANAGER'}
              >
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

      {/* Shifts List */}
      <div className="row g-3">
        {shifts.map((shift) => (
          <div key={shift.id} className="col-md-6 col-lg-4">
            <div className={`shift-card ${getAssignmentStatus(shift) === 'success' ? 'confirmed' : ''}`}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="mb-0">{shift.title}</h5>
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-link p-0"
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => handleOpenAssignModal(shift)}
                      >
                        <i className="bi bi-people me-2"></i>
                        Phân công
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => setConfirmDelete(shift.id)}
                      >
                        <i className="bi bi-trash me-2"></i>
                        Xóa
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              
              <p className="mb-2 small text-muted">
                <i className="bi bi-calendar me-2"></i>
                {formatDateTime(shift.startDatetime)}
              </p>
              <p className="mb-2 small text-muted">
                <i className="bi bi-clock me-2"></i>
                {formatTime(shift.startDatetime)} - {formatTime(shift.endDatetime)}
              </p>
              
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className={`badge bg-${getAssignmentStatus(shift)}`}>
                  {shift.confirmedCount}/{shift.requiredSlots} đã xác nhận
                </span>
                <button
                  className="btn btn-sm btn-outline-coffee"
                  onClick={() => handleOpenAssignModal(shift)}
                >
                  <i className="bi bi-people"></i>
                </button>
              </div>

              {shift.assignments && shift.assignments.length > 0 && (
                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted">Nhân viên:</small>
                  <div className="mt-1">
                    {shift.assignments.map((a: any) => (
                      <span
                        key={a.id}
                        className={`badge me-1 mb-1 ${
                          a.status === 'CONFIRMED' ? 'bg-success' :
                          a.status === 'DECLINED' ? 'bg-danger' : 'bg-warning'
                        }`}
                      >
                        {a.userName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {shifts.length === 0 && (
          <div className="col-12">
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar-x fs-1 d-block mb-3"></i>
              <p>Chưa có ca làm nào. Hãy tạo ca làm mới!</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Shift Modal */}
      {showModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Tạo ca làm mới</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleCreateShift}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Tên ca *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="VD: Ca sáng, Ca chiều..."
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thời gian bắt đầu *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.startDatetime}
                        onChange={(e) =>
                          setFormData({ ...formData, startDatetime: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thời gian kết thúc *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.endDatetime}
                        onChange={(e) =>
                          setFormData({ ...formData, endDatetime: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Số nhân viên cần</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.requiredSlots}
                        onChange={(e) =>
                          setFormData({ ...formData, requiredSlots: Number(e.target.value) })
                        }
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-coffee">
                      Tạo ca
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {/* Assign Staff Modal */}
      {showAssignModal && selectedShift && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Phân công nhân viên - {selectedShift.title}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAssignModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted mb-3">
                    Chọn nhân viên để phân công vào ca này (cần {selectedShift.requiredSlots} người):
                  </p>
                  <div className="list-group">
                    {storeStaff.map((staff) => (
                      <label
                        key={staff.id}
                        className="list-group-item list-group-item-action d-flex align-items-center"
                      >
                        <input
                          type="checkbox"
                          className="form-check-input me-3"
                          checked={selectedUserIds.includes(staff.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUserIds([...selectedUserIds, staff.id]);
                            } else {
                              setSelectedUserIds(selectedUserIds.filter((id) => id !== staff.id));
                            }
                          }}
                        />
                        <div className="avatar me-2">{staff.fullName.charAt(0)}</div>
                        <div>
                          <strong>{staff.fullName}</strong>
                          <br />
                          <small className="text-muted">{staff.email}</small>
                        </div>
                      </label>
                    ))}
                    {storeStaff.length === 0 && (
                      <p className="text-muted text-center py-3">
                        Không có nhân viên nào tại cơ sở này
                      </p>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-coffee"
                    onClick={handleAssignStaff}
                    disabled={selectedUserIds.length === 0}
                  >
                    Phân công ({selectedUserIds.length})
                  </button>
                </div>
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
        message="Bạn có chắc chắn muốn xóa ca làm này?"
        confirmText="Xóa"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Shifts;

