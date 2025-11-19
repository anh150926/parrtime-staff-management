/* file: frontend/src/pages/admin/AdminDashboard.tsx */
import React, { useEffect, useState } from "react";
import { dashboardApi } from "../../api/dashboardApi";
import { SuperAdminDashboardDto } from "../../models/Dashboard";
import { Spinner } from "../../components/shared/Spinner";

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<SuperAdminDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getSuperAdminDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="mb-4 fw-bold text-dark border-bottom pb-2">
        Tổng quan Chuỗi
      </h2>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-4 border-primary h-100">
            <div className="card-body">
              <h6 className="text-muted text-uppercase mb-2">Tổng Chi Nhánh</h6>
              <h2 className="mb-0 fw-bold text-primary">
                {data?.totalBranches}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-4 border-success h-100">
            <div className="card-body">
              <h6 className="text-muted text-uppercase mb-2">Tổng Nhân sự</h6>
              <h2 className="mb-0 fw-bold text-success">{data?.totalStaff}</h2>
              <small className="text-muted">
                Gồm {data?.totalManagers} Quản lý
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-4 border-warning h-100">
            <div className="card-body">
              <h6 className="text-muted text-uppercase mb-2">
                Chi phí Lương tháng
              </h6>
              <h2 className="mb-0 fw-bold text-warning">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(data?.totalPayrollCostThisMonth || 0)}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white fw-bold py-3">
          Hiệu suất theo Cơ sở
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Tên Cơ sở</th>
                  <th>Số lượng NV</th>
                  <th>Tổng giờ làm</th>
                  <th>Chi phí lương</th>
                </tr>
              </thead>
              <tbody>
                {data?.branchPerformance.map((branch) => (
                  <tr key={branch.branchId}>
                    <td className="ps-4 fw-bold">{branch.branchName}</td>
                    <td>{branch.staffCount}</td>
                    <td>{branch.workHours}h</td>
                    <td>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(branch.payrollCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
