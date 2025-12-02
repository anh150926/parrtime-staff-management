import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchStores } from '../features/stores/storeSlice';
import { fetchUsers } from '../features/users/userSlice';
import {
  fetchTasksByStore,
  fetchMyTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from '../features/tasks/taskSlice';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { formatDateTime } from '../utils/formatters';
import { CreateTaskRequest, TaskPriority, TaskStatus } from '../api/taskService';

const Tasks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stores } = useSelector((state: RootState) => state.stores);
  const { users } = useSelector((state: RootState) => state.users);
  const { tasks, myTasks, loading } = useSelector((state: RootState) => state.tasks);

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [formData, setFormData] = useState<CreateTaskRequest>({
    storeId: 0,
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedToId: undefined,
    dueDate: '',
    notes: '',
  });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const isStaff = user?.role === 'STAFF';
  const isManager = user?.role === 'MANAGER';
  const isOwner = user?.role === 'OWNER';

  useEffect(() => {
    dispatch(fetchStores());
    if (isStaff) {
      dispatch(fetchMyTasks());
    }
    if (isManager || isOwner) {
      dispatch(fetchUsers());
    }
  }, [dispatch, isStaff, isManager, isOwner]);

  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId && !isStaff) {
      const defaultStore = user?.storeId || stores[0].id;
      setSelectedStoreId(defaultStore);
    }
  }, [stores, user?.storeId, selectedStoreId, isStaff]);

  useEffect(() => {
    if (selectedStoreId && !isStaff) {
      dispatch(fetchTasksByStore(selectedStoreId));
    }
  }, [dispatch, selectedStoreId, isStaff]);

  // Ensure arrays are always valid
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeMyTasks = Array.isArray(myTasks) ? myTasks : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const storeStaff = safeUsers.filter(u => u.role === 'STAFF' && u.storeId === selectedStoreId);

  const handleOpenModal = () => {
    setFormData({
      storeId: selectedStoreId || 0,
      title: '',
      description: '',
      priority: 'MEDIUM',
      assignedToId: undefined,
      dueDate: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createTask({
        ...formData,
        storeId: selectedStoreId!,
      })).unwrap();
      setToast({ show: true, message: 'Tạo nhiệm vụ thành công!', type: 'success' });
      setShowModal(false);
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await dispatch(completeTask(taskId)).unwrap();
      setToast({ show: true, message: 'Đã hoàn thành nhiệm vụ!', type: 'success' });
      if (isStaff) {
        dispatch(fetchMyTasks());
      } else if (selectedStoreId) {
        dispatch(fetchTasksByStore(selectedStoreId));
      }
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      setToast({ show: true, message: 'Đã xóa nhiệm vụ!', type: 'success' });
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
    setConfirmDelete(null);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const badges: Record<TaskPriority, { class: string; label: string }> = {
      LOW: { class: 'bg-secondary', label: 'Thấp' },
      MEDIUM: { class: 'bg-info', label: 'Trung bình' },
      HIGH: { class: 'bg-warning text-dark', label: 'Cao' },
      URGENT: { class: 'bg-danger', label: 'Khẩn cấp' },
    };
    return badges[priority];
  };

  const getStatusBadge = (status: TaskStatus) => {
    const badges: Record<TaskStatus, { class: string; label: string }> = {
      PENDING: { class: 'bg-secondary', label: 'Chờ xử lý' },
      IN_PROGRESS: { class: 'bg-primary', label: 'Đang làm' },
      COMPLETED: { class: 'bg-success', label: 'Hoàn thành' },
      CANCELLED: { class: 'bg-dark', label: 'Đã hủy' },
    };
    return badges[status];
  };

  const displayTasks = isStaff ? safeMyTasks : safeTasks;
  const filteredTasks = displayTasks.filter(task => {
    if (filterStatus && task.status !== filterStatus) return false;
    if (filterPriority && task.priority !== filterPriority) return false;
    return true;
  });

  if (loading && displayTasks.length === 0) {
    return <Loading />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-list-check me-2"></i>
            {isStaff ? 'Nhiệm vụ của tôi' : 'Quản lý nhiệm vụ'}
          </h2>
          <p className="text-muted mb-0">
            {isStaff ? 'Danh sách công việc được giao' : 'Tạo và theo dõi nhiệm vụ'}
          </p>
        </div>
        {(isManager || isOwner) && (
          <button className="btn btn-coffee" onClick={handleOpenModal}>
            <i className="bi bi-plus-circle me-2"></i>
            Tạo nhiệm vụ
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card card-coffee mb-4">
        <div className="card-body">
          <div className="row align-items-center g-3">
            {!isStaff && (
              <div className="col-md-3">
                <label className="form-label mb-1 small">Cơ sở</label>
                <select
                  className="form-select"
                  value={selectedStoreId || ''}
                  onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                  disabled={isManager}
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-3">
              <label className="form-label mb-1 small">Trạng thái</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="IN_PROGRESS">Đang làm</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label mb-1 small">Độ ưu tiên</label>
              <select
                className="form-select"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="URGENT">Khẩn cấp</option>
                <option value="HIGH">Cao</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="LOW">Thấp</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Task Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card primary">
            <div className="stat-value">{displayTasks.filter(t => t.status === 'PENDING').length}</div>
            <div className="stat-label">Chờ xử lý</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card warning">
            <div className="stat-value">{displayTasks.filter(t => t.status === 'IN_PROGRESS').length}</div>
            <div className="stat-label">Đang làm</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card success">
            <div className="stat-value">{displayTasks.filter(t => t.status === 'COMPLETED').length}</div>
            <div className="stat-label">Hoàn thành</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card danger">
            <div className="stat-value">{displayTasks.filter(t => t.isOverdue).length}</div>
            <div className="stat-label">Quá hạn</div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="row g-3">
        {filteredTasks.map((task) => (
          <div key={task.id} className="col-md-6 col-lg-4">
            <div className={`card card-coffee h-100 ${task.isOverdue ? 'border-danger' : ''}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title mb-0">{task.title}</h5>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-link p-0" data-bs-toggle="dropdown">
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      {task.status !== 'COMPLETED' && (
                        <li>
                          <button 
                            className="dropdown-item text-success"
                            onClick={() => handleCompleteTask(task.id)}
                          >
                            <i className="bi bi-check-circle me-2"></i>
                            Hoàn thành
                          </button>
                        </li>
                      )}
                      {(isManager || isOwner) && (
                        <li>
                          <button 
                            className="dropdown-item text-danger"
                            onClick={() => setConfirmDelete(task.id)}
                          >
                            <i className="bi bi-trash me-2"></i>
                            Xóa
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="d-flex gap-1 mb-2">
                  <span className={`badge ${getPriorityBadge(task.priority).class}`}>
                    {getPriorityBadge(task.priority).label}
                  </span>
                  <span className={`badge ${getStatusBadge(task.status).class}`}>
                    {getStatusBadge(task.status).label}
                  </span>
                  {task.isOverdue && (
                    <span className="badge bg-danger">Quá hạn</span>
                  )}
                </div>

                {task.description && (
                  <p className="small text-muted mb-2">{task.description}</p>
                )}

                {task.dueDate && (
                  <p className="small mb-1">
                    <i className="bi bi-calendar-event me-1"></i>
                    Hạn: {formatDateTime(task.dueDate)}
                  </p>
                )}

                {task.assignedToName && (
                  <p className="small mb-1">
                    <i className="bi bi-person me-1"></i>
                    {task.assignedToName}
                  </p>
                )}

                {task.status !== 'COMPLETED' && (
                  <button 
                    className="btn btn-success btn-sm w-100 mt-2"
                    onClick={() => handleCompleteTask(task.id)}
                  >
                    <i className="bi bi-check me-1"></i>
                    Hoàn thành
                  </button>
                )}

                {task.status === 'COMPLETED' && task.completedAt && (
                  <p className="small text-success mb-0 mt-2">
                    <i className="bi bi-check-circle me-1"></i>
                    Hoàn thành: {formatDateTime(task.completedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="col-12 text-center py-5 text-muted">
            <i className="bi bi-clipboard-check fs-1 d-block mb-3"></i>
            <p>Không có nhiệm vụ nào</p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Tạo nhiệm vụ mới</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleCreateTask}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Tiêu đề *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Nhập tiêu đề nhiệm vụ"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Mô tả</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Mô tả chi tiết nhiệm vụ..."
                        ></textarea>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Độ ưu tiên *</label>
                        <select
                          className="form-select"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                        >
                          <option value="LOW">Thấp</option>
                          <option value="MEDIUM">Trung bình</option>
                          <option value="HIGH">Cao</option>
                          <option value="URGENT">Khẩn cấp</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Giao cho</label>
                        <select
                          className="form-select"
                          value={formData.assignedToId || ''}
                          onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value ? Number(e.target.value) : undefined })}
                        >
                          <option value="">-- Chọn nhân viên --</option>
                          {storeStaff.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              {staff.fullName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Hạn hoàn thành</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Ghi chú</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Ghi chú thêm..."
                        ></textarea>
                      </div>
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
                      Tạo nhiệm vụ
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
        message="Bạn có chắc chắn muốn xóa nhiệm vụ này?"
        confirmText="Xóa"
        onConfirm={() => confirmDelete && handleDeleteTask(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Tasks;


