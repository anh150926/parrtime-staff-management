/*
 * file: frontend/src/App.tsx
 *
 * Component gốc của ứng dụng.
 * Chịu trách nhiệm import các file CSS tùy chỉnh và hiển thị Router.
 */
import React from "react";
import { AppRouter } from "./routes";

// --- Import Custom Styles (Theo thứ tự) ---
// 1. Base (Biến, Reset)
import "./styles/_base.css";

// 2. Layout (Khung sườn)
import "./styles/_layout.css";

// 3. Components (Form, Table, Modal)
import "./styles/_form.css";
import "./styles/_table.css";
import "./styles/_modal.css";

// 4. Pages (Dashboard, Auth, Schedule)
import "./styles/_auth.css";
import "./styles/_dashboard.css";
import "./styles/_schedule.css";

const App: React.FC = () => {
  return <AppRouter />;
};

export default App;
