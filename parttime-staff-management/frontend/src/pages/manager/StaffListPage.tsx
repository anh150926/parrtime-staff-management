/* file: frontend/src/pages/manager/StaffListPage.tsx */
import React, { useEffect, useState } from "react";
import { staffApi } from "../../api/staffApi";
import { StaffProfileDto } from "../../models/Staff";
import { Button } from "../../components/shared/Button";
import { Link } from "react-router-dom";

export const StaffListPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffProfileDto[]>([]);

  useEffect(() => {
    staffApi.getStaffForBranch().then(setStaffList);
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Danh sách Nhân viên</h2>
        <Button icon="bi-person-plus">Thêm Nhân viên</Button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Mã NV</th>
                <th>Họ tên</th>
                <th>Chức vụ</th>
                <th>SĐT</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff.userId}>
                  <td className="ps-4">{staff.employeeCode}</td>
                  <td className="fw-bold">{staff.fullName}</td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {staff.positionName}
                    </span>
                  </td>
                  <td>{staff.phoneNumber}</td>
                  <td>
                    <Link
                      to={`/manager/staff/${staff.userId}`}
                      className="btn btn-sm btn-outline-primary me-2"
                    >
                      Chi tiết
                    </Link>
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
