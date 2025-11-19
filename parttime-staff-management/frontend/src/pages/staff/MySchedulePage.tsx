/* file: frontend/src/pages/staff/MySchedulePage.tsx */
import React, { useEffect, useState } from "react";
import { requestApi } from "../../api/requestApi";
import { scheduleApi } from "../../api/scheduleApi";
import { ScheduleViewDto, ShiftMarketDto } from "../../models/Schedule";
// Đảm bảo đường dẫn import này đúng với cấu trúc file bạn đã tạo
import { ShiftMarketplace } from "../../components/schedule/ShiftMarketplace";
import { ScheduleCalendar } from "../../components/schedule/ScheduleCalendar";
import { Spinner } from "../../components/shared/Spinner";

export const MySchedulePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("my-schedule");
  const [mySchedule, setMySchedule] = useState<ScheduleViewDto[]>([]);
  const [marketShifts, setMarketShifts] = useState<ShiftMarketDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const scheduleData = await scheduleApi.getScheduleForWeek(today);
        setMySchedule(scheduleData);

        if (activeTab === "market") {
          const marketData = await requestApi.getAvailableMarketShifts();
          setMarketShifts(marketData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleClaimShift = async (marketId: number) => {
    if (window.confirm("Bạn có chắc muốn nhận ca này không?")) {
      try {
        await requestApi.claimShift(marketId);
        alert("Đã gửi yêu cầu nhận ca! Chờ Quản lý duyệt.");
        const marketData = await requestApi.getAvailableMarketShifts();
        setMarketShifts(marketData);
      } catch (e) {
        console.error(e); // <--- [SỬA LỖI]
        alert("Lỗi khi nhận ca.");
      }
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Lịch làm việc</h2>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "my-schedule" ? "active fw-bold" : "text-muted"
                }`}
                onClick={() => setActiveTab("my-schedule")}
              >
                Lịch của tôi
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "market" ? "active fw-bold" : "text-muted"
                }`}
                onClick={() => setActiveTab("market")}
              >
                Chợ Ca <span className="badge bg-danger ms-1">Hot</span>
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-4">
          {loading ? (
            <Spinner />
          ) : (
            <>
              {activeTab === "my-schedule" && (
                <ScheduleCalendar schedules={mySchedule} />
              )}
              {activeTab === "market" && (
                <ShiftMarketplace
                  shifts={marketShifts}
                  onClaim={handleClaimShift}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
