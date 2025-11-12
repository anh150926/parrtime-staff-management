/*
 * file: frontend/src/pages/HomePage.tsx
 */
import React from "react";
import { useAuthStore } from "../store/authStore";

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="page-container">
      <h2>Chào mừng đến với Hệ thống Quản lý</h2>
      {user && (
        <div>
          <p>Tên: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Quyền: {user.role}</p>
          <p>ID Nhà hàng: {user.restaurantId}</p>
        </div>
      )}
    </div>
  );
};
