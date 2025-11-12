/*
 * file: frontend/src/pages/LoginPage.tsx
 */
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/authApi";
import { AuthRequest } from "../models/Auth";

export const LoginPage: React.FC = () => {
  const { login: loginToStore } = useAuthStore();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthRequest>();

  const onSubmit: SubmitHandler<AuthRequest> = async (data) => {
    setServerError(null);
    try {
      const authResponse = await authApi.login(data);
      loginToStore(authResponse);
      navigate("/");
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setServerError(error.response.data.message);
      } else {
        setServerError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="auth-page">
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {serverError && <div className="error-message">{serverError}</div>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register("email", { required: "Email là bắt buộc" })}
          />
          {errors.email && (
            <span className="error-message">{errors.email.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            {...register("password", { required: "Mật khẩu là bắt buộc" })}
          />
          {errors.password && (
            <span className="error-message">{errors.password.message}</span>
          )}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
      <p>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
};
