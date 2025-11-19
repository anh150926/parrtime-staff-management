/* file: frontend/src/pages/staff/MyProfilePage.tsx */
import React, { useEffect, useState } from "react";
import { staffApi } from "../../api/staffApi";
import { StaffProfileDto } from "../../models/Staff";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/shared/Button";
import { Input } from "../../components/shared/Input";
import { Spinner } from "../../components/shared/Spinner";

export const MyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StaffProfileDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    address: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      staffApi
        .getProfile(user.id)
        .then((data) => {
          setProfile(data);
          setFormData({
            phoneNumber: data.phoneNumber,
            address: data.address || "",
            email: data.email,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await staffApi.updateMyProfile(formData);
      setIsEditing(false);
      alert("Cập nhật thành công!");
      const updated = await staffApi.getProfile(user!.id);
      setProfile(updated);
    } catch (e) {
      console.error(e); // <--- [SỬA LỖI]: In lỗi ra console để dùng biến 'e'
      alert("Lỗi cập nhật.");
    }
  };

  if (loading) return <Spinner />;
  if (!profile) return null;

  return (
    <div className="container-fluid p-0">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Hồ sơ cá nhân</h5>
              {!isEditing && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </Button>
              )}
            </div>
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: "80px", height: "80px", fontSize: "2rem" }}
                >
                  {profile.fullName.charAt(0)}
                </div>
                <h4 className="fw-bold">{profile.fullName}</h4>
                <span className="badge bg-secondary">
                  {profile.positionName}
                </span>
              </div>

              <form>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small">
                      Mã nhân viên
                    </label>
                    <div className="form-control bg-light">
                      {profile.employeeCode}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">CCCD</label>
                    <div className="form-control bg-light">{profile.cccd}</div>
                  </div>

                  <div className="col-md-6">
                    <Input
                      label="Email"
                      value={formData.email}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      label="Số điện thoại"
                      value={formData.phoneNumber}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <Input
                      label="Địa chỉ"
                      value={formData.address}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Hủy
                    </Button>
                    <Button onClick={handleSave}>Lưu thay đổi</Button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
