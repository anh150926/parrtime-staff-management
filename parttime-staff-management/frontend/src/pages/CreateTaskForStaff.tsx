import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { fetchStores } from "../features/stores/storeSlice";
import { fetchUsers } from "../features/users/userSlice";
import {
  fetchTasksByStore,
  createTask,
  updateTask,
  deleteTask,
} from "../features/tasks/taskSlice";
import Loading from "../components/Loading";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { formatDateTime } from "../utils/formatters";
import {
  CreateTaskRequest,
  TaskPriority,
  TaskStatus,
} from "../api/taskService";

const CreateTaskForStaff: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stores } = useSelector((state: RootState) => state.stores);
  const { users } = useSelector((state: RootState) => state.users);
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
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
  const [staffList, setStaffList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [assignToAll, setAssignToAll] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  const isManager = user?.role === "MANAGER";
  const isOwner = user?.role === "OWNER";

  useEffect(() => {
    dispatch(fetchStores());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      const defaultStore = user?.storeId || stores[0].id;
      setSelectedStoreId(defaultStore);
      setFormData((prev) => ({ ...prev, storeId: defaultStore }));
    }
  }, [stores, user?.storeId, selectedStoreId]);

  useEffect(() => {
    if (selectedStoreId) {
      dispatch(fetchTasksByStore(selectedStoreId));
      // Filter staff for the selected store
      // Owner có thể tạo task cho cả Manager và Staff; Manager chỉ tạo cho Staff
      const filtered = users.filter((u) => {
        if (isOwner) {
          return (
            (u.role === "STAFF" || u.role === "MANAGER") &&
            u.storeId === selectedStoreId
          );
        } else {
          return u.role === "STAFF" && u.storeId === selectedStoreId;
        }
      });
      setStaffList(filtered);
    }
  }, [dispatch, selectedStoreId, users, isOwner]);

  const handleStoreChange = (storeId: number) => {
    setSelectedStoreId(storeId);
    setFormData((prev) => ({ ...prev, storeId }));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setToast({
        show: true,
        message: "Vui lòng nhập tiêu đề nhiệm vụ!",
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

    if (!assignToAll && !formData.assignedToId) {
      setToast({
        show: true,
        message:
          'Vui lòng chọn nhân viên hoặc chọn "Giao cho tất cả nhân viên"!',
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const taskData = {
        ...formData,
        storeId: selectedStoreId!,
        // If assignToAll is true, set assignedToId to undefined so backend doesn't assign to anyone specific
        assignedToId: assignToAll ? undefined : formData.assignedToId,
      };
      await dispatch(createTask(taskData)).unwrap();
      setToast({
        show: true,
        message: "Tạo nhiệm vụ thành công!",
        type: "success",
      });
      // Reset form
      setFormData({
        storeId: selectedStoreId!,
        title: "",
        description: "",
        priority: "MEDIUM",
        assignedToId: undefined,
        dueDate: "",
        notes: "",
        status: "PENDING",
      });
      setAssignToAll(false);
      // Refresh tasks list
      if (selectedStoreId) {
        dispatch(fetchTasksByStore(selectedStoreId));
      }
    } catch (err: any) {
      setToast({ show: true, message: err || "Có lỗi xảy ra!", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartTask = async (taskId: number) => {
    try {
      await dispatch(
        updateTask({
          id: taskId,
          data: { status: "IN_PROGRESS" },
        })
      ).unwrap();
      setToast({
        show: true,
        message: "Đã bắt đầu làm nhiệm vụ!",
        type: "success",
      });
      if (selectedStoreId) {
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
      if (selectedStoreId) {
        dispatch(fetchTasksByStore(selectedStoreId));
      }
    } catch (err: any) {
      setToast({ show: true, message: err || "Có lỗi xảy ra!", type: "error" });
    }
    setConfirmDelete(null);
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      LOW: { class: "bg-secondary", label: "Thấp" },
      MEDIUM: { class: "bg-info", label: "Trung bình" },
      HIGH: { class: "bg-warning text-dark", label: "Cao" },
      URGENT: { class: "bg-danger", label: "Khẩn cấp" },
    };
    return badges[priority] || badges.MEDIUM;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      PENDING: { class: "bg-secondary", label: "Chờ xử lý" },
      IN_PROGRESS: { class: "bg-primary", label: "Đang làm" },
      COMPLETED: { class: "bg-success", label: "Hoàn thành" },
      CANCELLED: { class: "bg-dark", label: "Đã hủy" },
    };
    return badges[status] || badges.PENDING;
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const filteredTasks = safeTasks.filter((task) => {
    if (filterStatus && task.status !== filterStatus) return false;
    return true;
  });

  const assignedStaffMap = new Map<number, string>();
  safeTasks.forEach((task) => {
    if (task.assignedToId && task.assignedToName) {
      assignedStaffMap.set(task.assignedToId, task.assignedToName);
    }
  });

  if (!isManager && !isOwner) {
    return (
      <div className="text-center py-5">
        <h4>Bạn không có quyền truy cập trang này</h4>
        <p className="text-muted">
          Chỉ Quản lý và Chủ sở hữu mới có thể tạo nhiệm vụ cho nhân viên
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">
          <i className="bi bi-clipboard-check me-2"></i>
          Giao nhiệm vụ cho nhân viên
        </h2>
        <p className="text-muted mb-0">
          Tạo và quản lý nhiệm vụ cho nhân viên của bạn
        </p>
      </div>

      <div className="row g-4">
        {/* Create Task Form */}
        <div className="col-lg-5">
          <div className="card card-coffee">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Tạo nhiệm vụ mới
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleCreateTask}>
                <div className="mb-3">
                  <label className="form-label">Cơ sở *</label>
                  <select
                    className="form-select"
                    value={selectedStoreId || ""}
                    onChange={(e) => handleStoreChange(Number(e.target.value))}
                    disabled={stores.length <= 1}
                  >
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Tiêu đề *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Nhập tiêu đề nhiệm vụ"
                    required
                  />
                  <small className="text-muted">
                    Mô tả ngắn gọn về nhiệm vụ
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Mô tả chi tiết</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Nhập mô tả chi tiết về nhiệm vụ..."
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">Giao cho *</label>
                  <div className="mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="assignToAll"
                        checked={assignToAll}
                        onChange={(e) => {
                          setAssignToAll(e.target.checked);
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              assignedToId: undefined,
                            });
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor="assignToAll">
                        Giao cho tất cả nhân viên
                      </label>
                    </div>
                  </div>
                  <select
                    className="form-select"
                    value={formData.assignedToId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assignedToId: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    disabled={assignToAll}
                  >
                    <option value="">
                      -- Chọn nhân viên (nếu không chọn "Giao cho tất cả") --
                    </option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.fullName}
                      </option>
                    ))}
                  </select>
                  {staffList.length === 0 && (
                    <small className="text-warning">
                      Không có nhân viên nào trong cơ sở này
                    </small>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Độ ưu tiên *</label>
                    <select
                      className="form-select"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                </div>

                <div className="mb-3">
                  <label className="form-label">Hạn hoàn thành *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    required
                  />
                  <small className="text-muted">
                    Chọn ngày giờ cụ thể để hoàn thành
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Ghi chú thêm..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-coffee w-100"
                  disabled={submitting || staffList.length === 0}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Tạo nhiệm vụ
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="col-lg-7">
          <div className="card card-coffee">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="bi bi-list-check me-2"></i>
                  Danh sách nhiệm vụ ({filteredTasks.length})
                </h5>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "150px" }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="IN_PROGRESS">Đang làm</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </select>
              </div>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Loading />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  <p>Không có nhiệm vụ nào</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="list-group-item p-3 border-bottom"
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{task.title}</h6>
                          <div className="d-flex gap-2 align-items-center flex-wrap">
                            <span
                              className={`badge ${
                                getPriorityBadge(task.priority).class
                              } small`}
                            >
                              {getPriorityBadge(task.priority).label}
                            </span>
                            <span
                              className={`badge ${
                                getStatusBadge(task.status).class
                              } small`}
                            >
                              {getStatusBadge(task.status).label}
                            </span>
                            {task.isOverdue && (
                              <span className="badge bg-danger small">
                                Quá hạn
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-link text-danger p-0"
                          onClick={() => setConfirmDelete(task.id)}
                          title="Xóa"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>

                      {task.description && (
                        <p className="small text-muted mb-2">
                          {task.description}
                        </p>
                      )}

                      <div className="row g-2 small text-muted">
                        {task.assignedToName ? (
                          <div className="col-auto">
                            <i className="bi bi-person me-1"></i>
                            <strong>{task.assignedToName}</strong>
                          </div>
                        ) : (
                          <div className="col-auto">
                            <i className="bi bi-people me-1"></i>
                            <strong className="text-info">
                              Giao cho tất cả nhân viên
                            </strong>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="col-auto">
                            <i className="bi bi-calendar-event me-1"></i>
                            {formatDateTime(task.dueDate)}
                          </div>
                        )}
                        {task.createdAt && (
                          <div className="col-auto">
                            <i className="bi bi-clock me-1"></i>
                            Tạo: {formatDateTime(task.createdAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {safeTasks.length > 0 && (
            <div className="row g-3 mt-3">
              <div className="col-6 col-md-3">
                <div className="stat-card primary">
                  <div className="stat-value">
                    {safeTasks.filter((t) => t.status === "PENDING").length}
                  </div>
                  <div className="stat-label">Chờ xử lý</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card warning">
                  <div className="stat-value">
                    {safeTasks.filter((t) => t.status === "IN_PROGRESS").length}
                  </div>
                  <div className="stat-label">Đang làm</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card success">
                  <div className="stat-value">
                    {safeTasks.filter((t) => t.status === "COMPLETED").length}
                  </div>
                  <div className="stat-label">Hoàn thành</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card danger">
                  <div className="stat-value">
                    {safeTasks.filter((t) => t.isOverdue).length}
                  </div>
                  <div className="stat-label">Quá hạn</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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

export default CreateTaskForStaff;
