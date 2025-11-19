import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { staffApi } from "../../api/staffApi";
import { StaffProfileDto } from "../../models/Staff";
import { Spinner } from "../../components/shared/Spinner";
import { Button } from "../../components/shared/Button";

export const StaffProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StaffProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      staffApi
        .getProfile(parseInt(id))
        .then(setProfile)
        .catch(() => alert("Không tìm thấy nhân viên"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Spinner />;
  if (!profile) return null;

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <Button
          variant="link"
          className="p-0 text-decoration-none text-muted"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-1"></i> Quay lại
        </Button>
      </div>

      <div className="row">
        {/* Cột trái: Avatar & Thông tin chính */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-0 text-center p-4 h-100">
            <div className="mb-3">
              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                style={{ width: "100px", height: "100px", fontSize: "2.5rem" }}
              >
                {profile.fullName.charAt(0)}
              </div>
            </div>
            <h3 className="fw-bold mb-1">{profile.fullName}</h3>
            <p className="text-muted mb-2">{profile.positionName}</p>
            <div className="mb-3">
              <span
                className={`badge ${
                  profile.status === "ACTIVE" ? "bg-success" : "bg-secondary"
                }`}
              >
                {profile.status}
              </span>
            </div>
            <div className="d-grid gap-2">
              <Button variant="outline-primary" icon="bi-pencil">
                Chỉnh sửa thông tin
              </Button>
              <Button variant="outline-danger" icon="bi-lock">
                Đặt lại mật khẩu
              </Button>
            </div>
          </div>
        </div>

        {/* Cột phải: Chi tiết */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white fw-bold py-3">
              Thông tin cá nhân
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="small text-muted">Mã nhân viên</label>
                  <div className="fw-bold">{profile.employeeCode}</div>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted">Email</label>
                  <div className="fw-bold">{profile.email}</div>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted">Số điện thoại</label>
                  <div className="fw-bold">{profile.phoneNumber}</div>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted">CCCD</label>
                  <div className="fw-bold">
                    {profile.cccd || "Chưa cập nhật"}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted">Ngày sinh</label>
                  <div className="fw-bold">
                    {profile.dateOfBirth || "Chưa cập nhật"}
                  </div>
                </div>
                <div className="col-md-12">
                  <label className="small text-muted">Địa chỉ</label>
                  <div className="fw-bold">
                    {profile.address || "Chưa cập nhật"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hợp đồng & Lương */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold py-3">
              Hợp đồng & Lương
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="small text-muted">Loại hợp đồng</label>
                  <div className="fw-bold">Part-time (Theo giờ)</div>
                </div>
                <div className="col-md-6">
                  <label className="small text-muted">Lương cơ bản / Giờ</label>
                  <div className="fw-bold text-success">25.000 ₫ / giờ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
