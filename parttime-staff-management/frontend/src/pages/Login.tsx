import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../app/store";
import { login, clearError } from "../features/auth/authSlice";

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      dispatch(login({ username, password }));
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header-modern">
          <i className="bi bi-cup-hot-fill login-coffee-icon"></i>
          <h1 className="login-title">Coffee House</h1>
          <p className="login-subtitle">Hệ thống quản lý nhân viên</p>
        </div>

        <div className="login-body">
          {error && (
            <div className="alert alert-danger login-error-alert" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="mb-3">
              <label htmlFor="username" className="login-field-label">
                Tên đăng nhập
              </label>
              <div className="login-input-container">
                <div className="login-icon-section">
                  <i className="bi bi-person"></i>
                </div>
                <input
                  type="text"
                  className="form-control login-input-field"
                  id="username"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="login-field-label">
                Mật khẩu
              </label>
              <div className="login-input-container">
                <div className="login-icon-section">
                  <i className="bi bi-lock"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control login-input-field"
                  id="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-icon-section login-eye-section"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn login-signin-btn w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-right me-2"></i>
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          <div className="login-demo-box">
            <div className="login-demo-title">Tài khoản demo:</div>
            <div className="login-demo-content">
              <div className="login-demo-item">
                <strong>Owner:</strong> owner / password123
              </div>
              <div className="login-demo-item">
                <strong>Manager:</strong> managerA / password123
              </div>
              <div className="login-demo-item">
                <strong>Staff:</strong> staff_a01 / password123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
