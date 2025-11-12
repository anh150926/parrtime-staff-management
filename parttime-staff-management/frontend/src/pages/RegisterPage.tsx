/*
 * file: frontend/src/pages/RegisterPage.tsx
 */
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/authApi";
import { RegisterRequest } from "../models/Auth";

// Giả sử (bạn nên lấy danh sách này từ API)
const restaurants = [
  { id: 1, name: "Nhà hàng Phố Cổ" },
  { id: 2, name: "Nhà hàng Bờ Sông" },
  { id: 3, name: "Nhà hàng Sài Gòn Xưa" },
];

export const RegisterPage: React.FC = () => {
  const { login: loginToStore } = useAuthStore();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>();

  const onSubmit: SubmitHandler<RegisterRequest> = async (data) => {
    setServerError(null);
    try {
      const requestData = {
        ...data,
        restaurantId: Number(data.restaurantId),
      };
      const authResponse = await authApi.register(requestData);
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
      <h2>Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {serverError && <div className="error-message">{serverError}</div>}
        <div className="form-group">
          <label htmlFor="name">Họ và tên</label>
          <input
            id="name"
            {...register("name", { required: "Tên là bắt buộc" })}
          />
          {errors.name && (
            <span className="error-message">{errors.name.message}</span>
          )}
        </div>
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
          <label htmlFor="phoneNumber">Số điện thoại</label>
          <input
            id="phoneNumber"
            {...register("phoneNumber", { required: "SĐT là bắt buộc" })}
          />
          {errors.phoneNumber && (
            <span className="error-message">{errors.phoneNumber.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            {...register("password", {
              required: "Mật khẩu là bắt buộc",
              minLength: {
                value: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự",
              },
            })}
          />
          {errors.password && (
            <span className="error-message">{errors.password.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="restaurantId">Chọn nhà hàng</label>
          <select
            id="restaurantId"
            {...register("restaurantId", {
              required: "Vui lòng chọn nhà hàng",
            })}
          >
            <option value="">-- Chọn nhà hàng --</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          {errors.restaurantId && (
            <span className="error-message">{errors.restaurantId.message}</span>
          )}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
      <p>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
};
