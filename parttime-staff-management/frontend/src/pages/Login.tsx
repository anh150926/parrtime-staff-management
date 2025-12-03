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
        <div className="login-header">
          <i className="bi bi-cup-hot-fill fs-1 mb-3"></i>
          <h1>Coffee House</h1>
          <p>Hệ thống quản lý nhân viên</p>
        </div>

        <div className="login-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Tên đăng nhập
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
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
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-coffee w-100 py-2"
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
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          <hr className="my-4" />

          <div className="text-center text-muted small">
            <p className="mb-2">Tài khoản demo:</p>
            <p className="mb-1">
              <strong>Owner:</strong> owner / password123
            </p>
            <p className="mb-1">
              <strong>Manager:</strong> managerA / password123
            </p>
            <p className="mb-0">
              <strong>Staff:</strong> staff_a01 / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
