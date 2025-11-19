/* file: frontend/src/pages/admin/BranchManagementPage.tsx */
import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { BranchDto } from "../../models/Branch";
import { Button } from "../../components/shared/Button";

export const BranchManagementPage: React.FC = () => {
  const [branches, setBranches] = useState<BranchDto[]>([]);

  useEffect(() => {
    adminApi.getAllBranches().then(setBranches);
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark m-0">Quản lý Cơ sở</h2>
        <Button icon="bi-plus-lg">Thêm Cơ sở</Button>
      </div>

      <div className="row g-4">
        {branches.map((branch) => (
          <div key={branch.id} className="col-md-6 col-lg-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">
                <h5 className="card-title fw-bold text-primary">
                  {branch.name}
                </h5>
                <p className="card-text text-muted">
                  <i className="bi bi-geo-alt me-2"></i>
                  {branch.address}
                </p>
                <div className="d-flex gap-2 mt-3">
                  <Button variant="outline-primary" size="sm">
                    Sửa
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
