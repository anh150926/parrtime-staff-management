/* file: frontend/src/components/layout/MainLayout.tsx */
import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

export const MainLayout: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <div className="d-flex flex-grow-1">
        {/* Sidebar cố định */}
        <Sidebar />

        {/* Nội dung chính (có margin để tránh Sidebar và Navbar) */}
        <main
          className="flex-grow-1 d-flex flex-column"
          style={{ marginLeft: "260px", marginTop: "60px" }}
        >
          <div className="p-4 flex-grow-1">
            {/* Card bao ngoài nội dung cho đẹp */}
            <div className="container-fluid">
              <Outlet />
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};
