/* file: frontend/src/pages/public/LoginPage.tsx */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";
import { Role } from "../../models/Enums";
import { Button } from "../../components/shared/Button";
import { Input } from "../../components/shared/Input";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      login(response);

      if (response.role === Role.SUPER_ADMIN) navigate("/admin/dashboard");
      else if (response.role === Role.MANAGER) navigate("/manager/dashboard");
      else navigate("/staff/dashboard");
    } catch (error) {
      // [SỬA LỖI] Sử dụng biến err để log ra console
      console.error("Login error:", error);
      setError("Email hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div
        className="card shadow-lg border-0"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <i className="bi bi-cup-hot-fill text-primary display-4"></i>
            <h2 className="fw-bold mt-3">Đăng Nhập</h2>
            <p className="text-muted">Hệ thống quản lý nhân viên</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
            <Input
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-100 mt-3"
              size="lg"
            >
              Đăng nhập
            </Button>
          </form>
        </div>
        <div className="card-footer bg-white border-0 text-center py-3">
          <small className="text-muted">© 2025 PTSM Coffee System</small>
        </div>
      </div>
    </div>
  );
};
