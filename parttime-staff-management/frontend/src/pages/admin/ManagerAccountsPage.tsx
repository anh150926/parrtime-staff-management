/* file: frontend/src/pages/admin/ManagerAccountsPage.tsx */
import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { ManagerAccountDto } from "../../models/User";
import { Button } from "../../components/shared/Button";

export const ManagerAccountsPage: React.FC = () => {
  const [managers, setManagers] = useState<ManagerAccountDto[]>([]);

  useEffect(() => {
    adminApi.getManagers().then(setManagers);
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark m-0">Tài khoản Quản lý</h2>
        <Button icon="bi-person-plus-fill">Cấp Tài khoản mới</Button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Họ tên</th>
                <th>Email</th>
                <th>Quản lý Cơ sở</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((mgr) => (
                <tr key={mgr.userId}>
                  <td className="ps-4 fw-bold">{mgr.fullName}</td>
                  <td>{mgr.email}</td>
                  <td>
                    <span className="badge bg-info text-dark">
                      {mgr.branchName}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        mgr.status === "ACTIVE" ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {mgr.status}
                    </span>
                  </td>
                  <td>
                    <Button variant="link" size="sm">
                      Sửa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
