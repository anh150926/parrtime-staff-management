/* file: frontend/src/components/schedule/ShiftMarketplace.tsx */
import React from "react";
import { ShiftMarketDto } from "../../models/Schedule";
import { Button } from "../shared/Button";

interface Props {
  shifts: ShiftMarketDto[];
  onClaim: (marketId: number) => void;
}

// [QUAN TRỌNG] Phải có chữ 'export' ở đây
export const ShiftMarketplace: React.FC<Props> = ({ shifts, onClaim }) => {
  if (shifts.length === 0) {
    return (
      <div className="alert alert-info">
        Hiện không có ca nào đang bán trên chợ.
      </div>
    );
  }

  return (
    <div className="row g-3">
      {shifts.map((shift) => (
        <div key={shift.marketId} className="col-md-6 col-lg-4">
          <div className="card shadow-sm border-start border-4 border-info">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h5 className="card-title mb-0 text-primary">
                    {shift.shiftName}
                  </h5>
                  <small className="text-muted">{shift.shiftDate}</small>
                </div>
                <span className="badge bg-info text-dark">Chợ Ca</span>
              </div>

              <p className="card-text small mb-3">
                Thời gian:{" "}
                <strong>
                  {shift.startTime} - {shift.endTime}
                </strong>
                <br />
                Người bán: <strong>{shift.offeringUserName}</strong>
              </p>

              <Button
                onClick={() => onClaim(shift.marketId)}
                variant="outline-primary"
                size="sm"
                className="w-100"
              >
                <i className="bi bi-hand-index-thumb me-1"></i> Nhận Ca Này
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
