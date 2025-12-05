import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { fetchStores } from "../features/stores/storeSlice";
import { fetchUsers } from "../features/users/userSlice";
import {
  fetchTasksByStore,
  fetchMyTasks,
  createTask,
  updateTask,
  startTask,
  completeTask,
  deleteTask,
} from "../features/tasks/taskSlice";
import Loading from "../components/Loading";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { formatDateTime } from "../utils/formatters";
import {
  CreateTaskRequest,
  Task,
  TaskPriority,
  TaskStatus,
} from "../api/taskService";

const Tasks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stores } = useSelector((state: RootState) => state.stores);
  const { users } = useSelector((state: RootState) => state.users);
  const { tasks, myTasks, loading } = useSelector(
    (state: RootState) => state.tasks
  );

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [formData, setFormData] = useState<CreateTaskRequest>({
    storeId: 0,
    title: "",
    description: "",
    priority: "MEDIUM",
    assignedToId: undefined,
    dueDate: "",
    notes: "",
    status: "PENDING",
  });
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    description: string;
    priority: TaskPriority;
    assignedToId?: number;
    dueDate: string;
    notes: string;
  }>({
    title: "",
    description: "",
    priority: "MEDIUM",
    assignedToId: undefined,
    dueDate: "",
    notes: "",
  });

  const isStaff = user?.role === "STAFF";
  const isManager = user?.role === "MANAGER";
  const isOwner = user?.role === "OWNER";

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
  const storeStaff = safeUsers.filter(
    (u) => u.role === "STAFF" && u.storeId === selectedStoreId
  );

  const handleOpenModal = () => {
    setFormData({
      storeId: selectedStoreId || 0,
      title: "",
      description: "",
      priority: "MEDIUM",
      assignedToId: undefined,
      dueDate: "",
      notes: "",
      status: "PENDING",
    });
    setShowModal(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.title.trim()) {
        setToast({
          show: true,
          message: "Vui lòng nhập tiêu đề!",
          type: "error",
        });
        return;
      }
      if (!formData.dueDate) {
        setToast({
          show: true,
          message: "Vui lòng chọn hạn hoàn thành!",
          type: "error",
        });
        return;
      }
      await dispatch(
        createTask({
          ...formData,
          storeId: selectedStoreId!,
        })
      ).unwrap();
      setToast({
        show: true,
        message: "Tạo nhiệm vụ thành công!",
        type: "success",
      });
      setShowModal(false);
    } catch (err: any) {
      setToast({ show: true, message: err || "Có lỗi xảy ra!", type: "error" });
    }
  };

  const handleStartTask = async (taskId: number) => {
    try {
      await dispatch(startTask(taskId)).unwrap();
      setToast({
        show: true,
        message: "Đã bắt đầu làm nhiệm vụ!",
        type: "success",
      });
      if (isStaff) {
        dispatch(fetchMyTasks());
      } else if (selectedStoreId) {
        dispatch(fetchTasksByStore(selectedStoreId));
      }
    } catch (err: any) {
      setToast({ show: true, message: err || "Có lỗi xảy ra!", type: "error" });
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await dispatch(completeTask(taskId)).unwrap();
      setToast({
        show: true,
        message: "Đã hoàn thành nhiệm vụ!",
        type: "success",
      });
      if (isStaff) {
        dispatch(fetchMyTasks());
      } else if (selectedStoreId) {
        dispatch(fetchTasksByStore(selectedStoreId));
      }
    } catch (err: any) {
      setToast({ show: true, message: err || "Có lỗi xảy ra!", type: "error" });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      setToast({ show: true, message: "Đã xóa nhiệm vụ!", type: "success" });
    } catch (err: any) {
      setToast({ show: true, message: err || "Có lỗi xảy ra!", type: "error" });
    }
    setConfirmDelete(null);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditTask(task);
    setEditFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      assignedToId: task.assignedToId || undefined,
      dueDate: task.dueDate ? task.dueDate.slice(0, 16) : "",
      notes: task.notes || "",
    });
  };

  const handleUpdateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;

    try {
      if (!editFormData.title.trim()) {
        setToast({
          show: true,
          message: "Vui lòng nhập tiêu đề!",
          type: "error",
        });
        return;
      }
      await dispatch(
        updateTask({
          id: editTask.id,
          data: {
            title: editFormData.title,
            description: editFormData.description || undefined,
            priority: editFormData.priority,
            assignedToId: editFormData.assignedToId || undefined,
            dueDate: editFormData.dueDate || undefined,
            notes: editFormData.notes || undefined,
          },
        })
      ).unwrap();
      setToast({
        show: true,
        message: "Cập nhật nhiệm vụ thành công!",
        type: "success",
      });
      setEditTask(null);
      if (selectedStoreId) {
        dispatch(fetchTasksByStore(selectedStoreId));
      }
    } catch (err: any) {
      setToast({ show: true, message: err || "Có lỗi xảy ra!", type: "error" });
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const badges: Record<TaskPriority, { class: string; label: string }> = {
      LOW: { class: "bg-secondary", label: "Thấp" },
      MEDIUM: { class: "bg-info", label: "Trung bình" },
      HIGH: { class: "bg-warning text-dark", label: "Cao" },
      URGENT: { class: "bg-danger", label: "Khẩn cấp" },
    };
    return badges[priority];
  };

  const getStatusBadge = (status: TaskStatus) => {
    const badges: Record<TaskStatus, { class: string; label: string }> = {
      PENDING: { class: "bg-secondary", label: "Chờ xử lý" },
      IN_PROGRESS: { class: "bg-primary", label: "Đang làm" },
      COMPLETED: { class: "bg-success", label: "Hoàn thành" },
      CANCELLED: { class: "bg-dark", label: "Đã hủy" },
    };
    return badges[status];
  };

  // Helper function để tính isOverdue dựa trên thời gian client
  const checkOverdue = (task: Task): boolean => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    if (task.status === "COMPLETED") {
      // Task đã hoàn thành - kiểm tra có hoàn thành trễ không
      if (task.completedAt) {
        return new Date(task.completedAt) > dueDate;
      }
      return false;
    }
    // Task chưa hoàn thành - kiểm tra đã quá hạn chưa
    return dueDate < now;
  };

  // Cập nhật isOverdue cho mỗi task dựa trên thời gian client
  const displayTasks = (isStaff ? safeMyTasks : safeTasks).map((task) => ({
    ...task,
    isOverdue: checkOverdue(task),
  }));

  const filteredTasks = displayTasks.filter((task) => {
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
            {isStaff ? "Nhiệm vụ của tôi" : "Quản lý nhiệm vụ"}
          </h2>
          <p className="text-muted mb-0">
            {isStaff
              ? "Danh sách công việc được giao"
              : "Tạo và theo dõi nhiệm vụ"}
          </p>
        </div>
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
                  value={selectedStoreId || ""}
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
            <div className="stat-value">
              {
                displayTasks.filter(
                  (t) => t.status === "PENDING" && !t.isOverdue
                ).length
              }
            </div>
            <div className="stat-label">Chờ xử lý</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card warning">
            <div className="stat-value">
              {
                displayTasks.filter(
                  (t) => t.status === "IN_PROGRESS" && !t.isOverdue
                ).length
              }
            </div>
            <div className="stat-label">Đang làm</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card success">
            <div className="stat-value">
              {
                displayTasks.filter(
                  (t) => t.status === "COMPLETED" && !t.isOverdue
                ).length
              }
            </div>
            <div className="stat-label">Hoàn thành</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card danger">
            <div className="stat-value">
              {displayTasks.filter((t) => t.isOverdue).length}
            </div>
            <div className="stat-label">Quá hạn</div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="row g-3">
        {filteredTasks.map((task) => (
          <div key={task.id} className="col-md-6 col-lg-4">
            <div
              className={`card card-coffee h-100 ${
                task.isOverdue ? "border-danger" : ""
              }`}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title mb-0">{task.title}</h5>
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
                          onClick={() => setDetailTask(task)}
                        >
                          <i className="bi bi-eye me-2"></i>
                          Xem chi tiết
                        </button>
                      </li>
                      {/* Chỉ người tạo nhiệm vụ mới có quyền sửa */}
                      {(isManager || isOwner) && 
                        task.status !== "COMPLETED" && 
                        task.createdById === user?.id && (
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleOpenEditModal(task)}
                          >
                            <i className="bi bi-pencil me-2"></i>
                            Sửa
                          </button>
                        </li>
                      )}
                      {/* Chỉ người tạo nhiệm vụ mới có quyền xóa */}
                      {(isManager || isOwner) && task.createdById === user?.id && (
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
                  <span
                    className={`badge ${getPriorityBadge(task.priority).class}`}
                  >
                    {getPriorityBadge(task.priority).label}
                  </span>
                  <span
                    className={`badge ${getStatusBadge(task.status).class}`}
                  >
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

                {task.assignedToName ? (
                  <p className="small mb-1">
                    <i className="bi bi-person me-1"></i>
                    {task.assignedToName}
                  </p>
                ) : (
                  <p className="small mb-1 text-info">
                    <i className="bi bi-people me-1"></i>
                    <strong>Giao cho tất cả nhân viên</strong>
                  </p>
                )}

                {task.status === "PENDING" &&
                  // Nếu giao cho người cụ thể, chỉ người đó mới có nút. Nếu giao cho tất cả, ai cũng có nút. Nếu quá hạn thì không thể làm
                  (!task.assignedToId || task.assignedToId === user?.id) &&
                  !task.isOverdue && (
                    <button
                      className="btn btn-primary btn-sm w-100 mt-2"
                      onClick={() => handleStartTask(task.id)}
                    >
                      <i className="bi bi-play-fill me-1"></i>
                      Bắt đầu làm
                    </button>
                  )}

                {task.status === "IN_PROGRESS" &&
                  // Nếu giao cho người cụ thể, chỉ người đó mới có nút. Nếu giao cho tất cả, ai cũng có nút. Nếu quá hạn thì không thể hoàn thành
                  (!task.assignedToId || task.assignedToId === user?.id) &&
                  !task.isOverdue && (
                    <button
                      className="btn btn-success btn-sm w-100 mt-2"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      <i className="bi bi-check me-1"></i>
                      Hoàn thành
                    </button>
                  )}

                {task.status === "COMPLETED" && task.completedAt && (
                  <p className={`small mb-0 mt-2 ${task.isOverdue ? "text-danger" : "text-success"}`}>
                    <i className={`bi ${task.isOverdue ? "bi-exclamation-circle" : "bi-check-circle"} me-1`}></i>
                    {task.isOverdue ? "Hoàn thành trễ: " : "Hoàn thành: "}
                    {formatDateTime(task.completedAt)}
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

      {/* Detail modal (opened from three-dot menu) */}
      {detailTask && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">{detailTask.title}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setDetailTask(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  {detailTask.description && (
                    <p className="mb-2">{detailTask.description}</p>
                  )}
                  <div className="d-flex gap-2 mb-2">
                    <span
                      className={`badge ${
                        getPriorityBadge(detailTask.priority).class
                      }`}
                    >
                      {getPriorityBadge(detailTask.priority).label}
                    </span>
                    <span
                      className={`badge ${
                        getStatusBadge(detailTask.status).class
                      }`}
                    >
                      {getStatusBadge(detailTask.status).label}
                    </span>
                    {detailTask.isOverdue && (
                      <span className="badge bg-danger">Quá hạn</span>
                    )}
                  </div>
                  <p className="small mb-1">
                    <i className="bi bi-calendar-event me-1"></i>
                    Hạn:{" "}
                    {detailTask.dueDate
                      ? formatDateTime(detailTask.dueDate)
                      : "—"}
                  </p>
                  <p className="small mb-1">
                    <i className="bi bi-person me-1"></i>
                    {detailTask.assignedToName
                      ? detailTask.assignedToName
                      : "Giao cho tất cả nhân viên"}
                  </p>
                  {detailTask.notes && (
                    <p className="small text-muted">
                      <strong>Ghi chú:</strong> {detailTask.notes}
                    </p>
                  )}
                  {detailTask.completedAt && (
                    <p className="small text-success">
                      Hoàn thành: {formatDateTime(detailTask.completedAt)}
                    </p>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setDetailTask(null)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {/* Edit modal */}
      {editTask && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Sửa nhiệm vụ</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditTask(null)}
                  ></button>
                </div>
                <form onSubmit={handleUpdateTaskSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">
                        Tiêu đề <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.title}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Mô tả</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={editFormData.description}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, description: e.target.value })
                        }
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Độ ưu tiên</label>
                        <select
                          className="form-select"
                          value={editFormData.priority}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              priority: e.target.value as TaskPriority,
                            })
                          }
                        >
                          <option value="LOW">Thấp</option>
                          <option value="MEDIUM">Trung bình</option>
                          <option value="HIGH">Cao</option>
                          <option value="URGENT">Khẩn cấp</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Hạn hoàn thành</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={editFormData.dueDate}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, dueDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Giao cho</label>
                      <select
                        className="form-select"
                        value={editFormData.assignedToId || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            assignedToId: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      >
                        <option value="">Tất cả nhân viên</option>
                        {storeStaff.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Ghi chú</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={editFormData.notes}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, notes: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditTask(null)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check-lg me-1"></i>
                      Lưu thay đổi
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
