import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../features/users/userSlice";
import { fetchStores } from "../features/stores/storeSlice";
import { CreateUserRequest, UpdateUserRequest } from "../api/userService";
import Loading from "../components/Loading";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { formatCurrency, formatDateTime } from "../utils/formatters";

const Users: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { users, loading, error } = useSelector(
    (state: RootState) => state.users
  );
  const { stores } = useSelector((state: RootState) => state.stores);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    role: "STAFF",
    storeId: undefined,
    hourlyRate: undefined,
  });
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ show: false, message: "", type: "success" });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchStores());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      role: "STAFF",
      storeId:
        currentUser?.role === "MANAGER" ? currentUser.storeId : undefined,
      hourlyRate: undefined,
    });
    setEditingUser(null);
  };

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: "",
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        storeId: user.storeId,
        hourlyRate: user.hourlyRate,
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
      if (editingUser) {
        const updateData: UpdateUserRequest = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          storeId: formData.storeId,
          hourlyRate: formData.hourlyRate,
        };
        await dispatch(
          updateUser({ id: editingUser.id, data: updateData })
        ).unwrap();
        setToast({
          show: true,
          message: "Cập nhật nhân viên thành công!",
          type: "success",
        });
      } else {
        await dispatch(createUser(formData)).unwrap();
        setToast({
          show: true,
          message: "Thêm nhân viên thành công!",
          type: "success",
        });
      }
      handleCloseModal();
    } catch (err: any) {
      setToast({ show: true, message: err || "Có lỗi xảy ra!", type: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      setToast({
        show: true,
        message: "Xóa nhân viên thành công!",
        type: "success",
      });
    } catch (err: any) {
      setToast({ show: true, message: err || "Có lỗi xảy ra!", type: "error" });
    }
    setConfirmDelete(null);
  };

  const handleRestore = async (id: number) => {
    try {
      await dispatch(updateUser({ id, data: { status: "ACTIVE" } })).unwrap();
      setToast({
        show: true,
        message: "Khôi phục nhân viên thành công!",
        type: "success",
      });
    } catch (err: any) {
      setToast({ show: true, message: err || "Có lỗi xảy ra!", type: "error" });
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      OWNER: { class: "badge-owner", label: "Chủ sở hữu" },
      MANAGER: { class: "badge-manager", label: "Quản lý" },
      STAFF: { class: "badge-staff", label: "Nhân viên" },
    };
    return badges[role] || { class: "bg-secondary", label: role };
  };

  const getStatusBadge = (status: string) => {
    return status === "ACTIVE"
      ? { class: "status-active", label: "Hoạt động" }
      : { class: "status-inactive", label: "Ngừng" };
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý nhân viên</h2>
          <p className="text-muted mb-0">
            Danh sách và quản lý thông tin nhân viên
          </p>
        </div>
        <button className="btn btn-coffee" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm nhân viên
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card card-coffee">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-coffee mb-0">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Cơ sở</th>
                  <th>Lương/giờ</th>
                  <th>Trạng thái</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar me-2">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{user.fullName}</strong>
                          <br />
                          <small className="text-muted">@{user.username}</small>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`badge ${getRoleBadge(user.role).class}`}
                      >
                        {getRoleBadge(user.role).label}
                      </span>
                    </td>
                    <td>{user.storeName || "---"}</td>
                    <td>
                      {user.hourlyRate
                        ? formatCurrency(user.hourlyRate)
                        : "---"}
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusBadge(user.status).class}`}
                      >
                        {getStatusBadge(user.status).label}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => handleOpenModal(user)}
                        title="Sửa"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      {user.status === "INACTIVE" ? (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleRestore(user.id)}
                          title="Khôi phục"
                        >
                          <i className="bi bi-arrow-counterclockwise"></i>
                        </button>
                      ) : (
                        user.role !== "OWNER" &&
                        currentUser?.id !== user.id && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setConfirmDelete(user.id)}
                            title="Xóa"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      Chưa có nhân viên nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingUser ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      {!editingUser && (
                        <>
                          <div className="col-md-6">
                            <label className="form-label">
                              Tên đăng nhập *
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.username}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  username: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Mật khẩu *</label>
                            <input
                              type="password"
                              className="form-control"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  password: e.target.value,
                                })
                              }
                              required={!editingUser}
                            />
                          </div>
                        </>
                      )}
                      <div className="col-md-6">
                        <label className="form-label">Họ và tên *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fullName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Số điện thoại</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Vai trò *</label>
                        <select
                          className="form-select"
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              role: e.target.value as
                                | "OWNER"
                                | "MANAGER"
                                | "STAFF",
                            })
                          }
                          disabled={currentUser?.role === "MANAGER"}
                        >
                          {currentUser?.role === "OWNER" && (
                            <>
                              <option value="MANAGER">Quản lý</option>
                            </>
                          )}
                          <option value="STAFF">Nhân viên</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Cơ sở làm việc</label>
                        <select
                          className="form-select"
                          value={formData.storeId || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              storeId: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          disabled={currentUser?.role === "MANAGER"}
                        >
                          <option value="">-- Chọn cơ sở --</option>
                          {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                              {store.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Lương/giờ (VNĐ)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.hourlyRate || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hourlyRate: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          min="0"
                        />
                      </div>
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
                      {editingUser ? "Cập nhật" : "Thêm mới"}
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
        message="Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Users;
