import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchShiftsByStore, createShift, updateShift, deleteShift, assignStaffToShift } from '../features/shifts/shiftSlice';
import { fetchStores } from '../features/stores/storeSlice';
import { fetchUsers } from '../features/users/userSlice';
import { CreateShiftRequest } from '../api/shiftService';
import shiftService from '../api/shiftService';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [formData, setFormData] = useState<CreateShiftRequest>({
    title: '',
    startDatetime: '',
    endDatetime: '',
    requiredSlots: 1,
  });
  const [editFormData, setEditFormData] = useState<{ startDatetime: string; endDatetime: string; requiredSlots: number }>({
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

  const handleOpenEditModal = (shift: any) => {
    setSelectedShift(shift);
    // Chuyển đổi datetime sang format datetime-local (YYYY-MM-DDTHH:mm)
    const formatDateTimeLocal = (dateTime: string) => {
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    setEditFormData({
      startDatetime: formatDateTimeLocal(shift.startDatetime),
      endDatetime: formatDateTimeLocal(shift.endDatetime),
      requiredSlots: shift.requiredSlots || 1,
    });
    setShowEditModal(true);
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
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleUpdateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShift) return;
    
    try {
      // Gửi startDatetime, endDatetime và requiredSlots để cập nhật
      const updateData: CreateShiftRequest = {
        title: selectedShift.title,
        startDatetime: editFormData.startDatetime,
        endDatetime: editFormData.endDatetime,
        requiredSlots: editFormData.requiredSlots,
      };
      await dispatch(updateShift({ id: selectedShift.id, data: updateData })).unwrap();
      setToast({ show: true, message: 'Cập nhật ca làm thành công!', type: 'success' });
      setShowEditModal(false);
      // Refresh shifts
      if (selectedStoreId) {
        dispatch(fetchShiftsByStore({ storeId: selectedStoreId }));
      }
    } catch (err: any) {
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedShift) return;
    
    try {
      // Chỉ thêm những nhân viên mới (chưa được phân công)
      const currentAssignedIds = selectedShift.assignments?.map((a: any) => a.userId) || [];
      const newUserIds = selectedUserIds.filter(id => !currentAssignedIds.includes(id));
      const currentCount = selectedShift.assignments?.length || 0;
      const requiredSlots = selectedShift.requiredSlots || 1;
      
      // Kiểm tra xem có vượt quá số người cần không
      if (currentCount + newUserIds.length > requiredSlots) {
        setToast({ 
          show: true, 
          message: `Không thể phân công thêm. Ca này chỉ cần ${requiredSlots} người, hiện đã có ${currentCount} người.`, 
          type: 'error' 
        });
        return;
      }
      
      if (newUserIds.length > 0) {
        await dispatch(
          assignStaffToShift({ shiftId: selectedShift.id, data: { userIds: newUserIds } })
        ).unwrap();
        setToast({ show: true, message: 'Phân công nhân viên thành công!', type: 'success' });
      } else {
        setToast({ show: true, message: 'Không có nhân viên mới để thêm!', type: 'info' });
      }
      
      // Refresh shifts
      if (selectedStoreId) {
        dispatch(fetchShiftsByStore({ storeId: selectedStoreId }));
      }
      setShowAssignModal(false);
    } catch (err: any) {
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleRemoveAssignment = async (userId: number) => {
    if (!selectedShift) return;
    
    try {
      console.log('Removing assignment for userId:', userId, 'shiftId:', selectedShift.id);
      const response = await shiftService.removeAssignment(selectedShift.id, userId);
      console.log('Remove assignment response:', response);
      
      // response is ApiResponse<Shift>, so response.data is the Shift object
      const updatedShift = response.data;
      
      if (!updatedShift) {
        console.error('No data in response');
        setToast({ show: true, message: 'Không nhận được dữ liệu từ server!', type: 'error' });
        return;
      }
      
      setToast({ show: true, message: 'Đã xóa phân công nhân viên!', type: 'success' });
      
      // Update selectedShift with the updated data from response
      setSelectedShift(updatedShift);
      
      // Update selectedUserIds to match current assignments
      const assignedIds = updatedShift.assignments?.map((a: any) => a.userId) || [];
      setSelectedUserIds(assignedIds);
      
      // Refresh shifts list to update the main list
      if (selectedStoreId) {
        dispatch(fetchShiftsByStore({ storeId: selectedStoreId }));
      }
    } catch (err: any) {
      console.error('Error removing assignment:', err);
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteShift(id)).unwrap();
      setToast({ show: true, message: 'Xóa ca làm thành công!', type: 'success' });
    } catch (err: any) {
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
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
                        onClick={() => handleOpenEditModal(shift)}
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Chỉnh sửa
                      </button>
                    </li>
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

      {/* Edit Shift Modal */}
      {showEditModal && selectedShift && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Chỉnh sửa ca làm - {selectedShift.title}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleUpdateShift}>
                  <div className="modal-body">
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Bạn có thể chỉnh sửa thời gian bắt đầu, kết thúc và số người cần của ca làm việc này.
                    </div>
                    {selectedShift.assignments && selectedShift.assignments.length > 0 && (
                      <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Hiện đã có <strong>{selectedShift.assignments.length}</strong> người được phân công. 
                        Số người cần không được nhỏ hơn số người đã phân công.
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label">Tên ca</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedShift.title}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thời gian bắt đầu *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={editFormData.startDatetime}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, startDatetime: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thời gian kết thúc *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={editFormData.endDatetime}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, endDatetime: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Số nhân viên cần *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editFormData.requiredSlots}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          const minValue = selectedShift.assignments?.length || 0;
                          if (value >= minValue) {
                            setEditFormData({ ...editFormData, requiredSlots: value });
                          }
                        }}
                        min={selectedShift.assignments?.length || 0}
                        required
                      />
                      <small className="text-muted">
                        Tối thiểu: {selectedShift.assignments?.length || 0} (số người đã phân công)
                      </small>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-coffee">
                      Cập nhật
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
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="text-muted mb-0">
                        Quản lý phân công nhân viên cho ca này:
                      </p>
                      <span className={`badge ${(selectedShift.assignments?.length || 0) >= selectedShift.requiredSlots ? 'bg-success' : 'bg-warning'}`}>
                        {selectedShift.assignments?.length || 0} / {selectedShift.requiredSlots} người
                      </span>
                    </div>
                    {(selectedShift.assignments?.length || 0) >= selectedShift.requiredSlots && (
                      <div className="alert alert-success mb-0">
                        <i className="bi bi-check-circle me-2"></i>
                        Đã đủ số người cần cho ca này.
                      </div>
                    )}
                  </div>
                  
                  {/* Danh sách nhân viên đã được phân công */}
                  {selectedShift.assignments && selectedShift.assignments.length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-2">
                        <i className="bi bi-people-fill me-2"></i>
                        Nhân viên đã được phân công ({selectedShift.assignments.length})
                      </h6>
                      <div className="list-group">
                        {selectedShift.assignments.map((assignment: any) => {
                          const staff = storeStaff.find((s) => s.id === assignment.userId);
                          if (!staff) return null;
                          return (
                            <div
                              key={assignment.id}
                              className="list-group-item d-flex align-items-center justify-content-between"
                            >
                              <div className="d-flex align-items-center">
                                <div className="avatar me-2">{staff.fullName.charAt(0)}</div>
                                <div>
                                  <strong>{staff.fullName}</strong>
                                  <br />
                                  <small className={`text-muted ${
                                    assignment.status === 'CONFIRMED' ? 'text-success' :
                                    assignment.status === 'DECLINED' ? 'text-danger' : 'text-warning'
                                  }`}>
                                    {assignment.status === 'CONFIRMED' ? '✓ Đã xác nhận' :
                                     assignment.status === 'DECLINED' ? '✗ Đã từ chối' : '⏳ Đang chờ'}
                                  </small>
                                </div>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Bạn có chắc chắn muốn xóa phân công cho ${staff.fullName}?`)) {
                                    handleRemoveAssignment(assignment.userId);
                                  }
                                }}
                                title="Xóa phân công"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Danh sách nhân viên chưa được phân công */}
                  <div>
                    <h6 className="mb-2">
                      <i className="bi bi-person-plus me-2"></i>
                      Thêm nhân viên mới
                    </h6>
                    <div className="list-group">
                      {storeStaff
                        .filter((staff) => {
                          const assignedIds = selectedShift.assignments?.map((a: any) => a.userId) || [];
                          return !assignedIds.includes(staff.id);
                        })
                        .map((staff) => {
                          const currentCount = selectedShift.assignments?.length || 0;
                          const requiredSlots = selectedShift.requiredSlots || 1;
                          const isSelected = selectedUserIds.includes(staff.id);
                          const newUserIds = selectedUserIds.filter(id => {
                            const assignedIds = selectedShift.assignments?.map((a: any) => a.userId) || [];
                            return !assignedIds.includes(id);
                          });
                          const newCount = newUserIds.length;
                          // Disable nếu đã đủ người và checkbox này chưa được chọn
                          const isDisabled = currentCount >= requiredSlots && !isSelected;
                          
                          return (
                            <label
                              key={staff.id}
                              className={`list-group-item list-group-item-action d-flex align-items-center ${isDisabled ? 'opacity-50' : ''}`}
                            >
                              <input
                                type="checkbox"
                                className="form-check-input me-3"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    // Kiểm tra trước khi thêm
                                    if (currentCount + newCount >= requiredSlots) {
                                      setToast({ 
                                        show: true, 
                                        message: `Ca này chỉ cần ${requiredSlots} người. Không thể thêm thêm nhân viên.`, 
                                        type: 'warning' 
                                      });
                                      return;
                                    }
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
                          );
                        })}
                      {storeStaff.filter((staff) => {
                        const assignedIds = selectedShift.assignments?.map((a: any) => a.userId) || [];
                        return !assignedIds.includes(staff.id);
                      }).length === 0 && (
                        <p className="text-muted text-center py-3">
                          Tất cả nhân viên đã được phân công
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {storeStaff.length === 0 && (
                    <p className="text-muted text-center py-3">
                      Không có nhân viên nào tại cơ sở này
                    </p>
                  )}
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
                    disabled={(() => {
                      const currentCount = selectedShift.assignments?.length || 0;
                      const requiredSlots = selectedShift.requiredSlots || 1;
                      const newUserIds = selectedUserIds.filter(id => {
                        const assignedIds = selectedShift.assignments?.map((a: any) => a.userId) || [];
                        return !assignedIds.includes(id);
                      });
                      return newUserIds.length === 0 || currentCount >= requiredSlots;
                    })()}
                  >
                    Thêm nhân viên ({selectedUserIds.filter(id => {
                      const assignedIds = selectedShift.assignments?.map((a: any) => a.userId) || [];
                      return !assignedIds.includes(id);
                    }).length})
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

