/*
 * file: frontend/src/main.tsx
 *
 * Điểm khởi chạy của ứng dụng React.
 * Nơi import Bootstrap và các thư viện toàn cục.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 1. Import Bootstrap 5 (CSS & JS)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// 2. Import Bootstrap Icons
import "bootstrap-icons/font/bootstrap-icons.css";

// 3. Import CSS toàn cục (nếu có)
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
