/* file: frontend/src/components/schedule/ScheduleCalendar.tsx */
import React from "react";
import { ScheduleViewDto } from "../../models/Schedule";

interface Props {
  schedules: ScheduleViewDto[];
}

// [QUAN TRỌNG] Phải có chữ 'export'
export const ScheduleCalendar: React.FC<Props> = ({ schedules }) => {
  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 row-cols-xl-7 g-3">
      {schedules.map((sch) => (
        <div key={sch.scheduleId} className="col">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-light text-center fw-bold py-1 small">
              {sch.shiftDate}
            </div>
            <div className="card-body p-2 text-center">
              <h6 className="card-title text-primary mb-1">{sch.shiftName}</h6>
              <small className="text-muted d-block mb-2">
                {sch.startTime.slice(0, 5)} - {sch.endTime.slice(0, 5)}
              </small>

              <div className="progress mb-2" style={{ height: "6px" }}>
                <div
                  className={`progress-bar ${
                    sch.assignedStaffCount >= sch.requiredStaff
                      ? "bg-success"
                      : "bg-warning"
                  }`}
                  role="progressbar"
                  style={{
                    width: `${
                      (sch.assignedStaffCount / sch.requiredStaff) * 100
                    }%`,
                  }}
                ></div>
              </div>

              <div className="d-flex flex-column gap-1">
                {sch.assignedStaff.map((s) => (
                  <span
                    key={s.userId}
                    className={`badge rounded-pill ${
                      s.status === "CONFIRMED"
                        ? "bg-primary-subtle text-primary"
                        : "bg-warning-subtle text-dark"
                    }`}
                  >
                    {s.fullName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
