/* file: frontend/src/pages/shared/AccessDeniedPage.tsx */
import React from "react";
import { Link } from "react-router-dom";

export const AccessDeniedPage: React.FC = () => (
  <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-white text-center">
    <h1 className="display-1 fw-bold text-danger">403</h1>
    <h2 className="mb-4">Bạn không có quyền truy cập</h2>
    <Link to="/" className="btn btn-outline-dark">
      Quay về Trang chủ
    </Link>
  </div>
);
