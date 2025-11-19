/* file: frontend/src/pages/shared/NotFoundPage.tsx */
import React from "react";
import { Link } from "react-router-dom";

export const NotFoundPage: React.FC = () => (
  <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-white text-center">
    <h1 className="display-1 fw-bold text-muted">404</h1>
    <h2 className="mb-4">Không tìm thấy trang</h2>
    <Link to="/" className="btn btn-primary">
      Quay về Trang chủ
    </Link>
  </div>
);
