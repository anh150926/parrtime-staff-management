/* file: frontend/src/pages/staff/MyTasksPage.tsx */
import React, { useEffect, useState } from "react";
import { operationsApi } from "../../api/operationsApi";
import { TaskChecklistDto } from "../../models/Operations";
import { Checklist } from "../../components/operations/Checklist";
import { Spinner } from "../../components/shared/Spinner";
import { dashboardApi } from "../../api/dashboardApi";

export const MyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskChecklistDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentShiftName, setCurrentShiftName] = useState<string>("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // 1. Lấy ca làm sắp tới/hiện tại để biết Template ID
        const dashboardData = await dashboardApi.getStaffDashboard();
        const upcomingShift = dashboardData.upcomingShift;

        if (upcomingShift) {
          setCurrentShiftName(upcomingShift.shiftName);
          // GIẢ ĐỊNH: Backend trả về shiftTemplateId trong upcomingShift (cần update DTO BE nếu chưa có)
          // Tạm thời hardcode logic: Nếu ca hiện tại có, gọi API lấy checklist
          // Trong thực tế, cần gọi API: /checklists/assignment/{assignmentId}
          // Ở đây ta giả lập gọi theo template ID (ví dụ ID=1)
          const data = await operationsApi.getChecklistForTemplate(1);
          setTasks(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleToggleTask = async (taskId: number) => {
    try {
      await operationsApi.logTaskCompletion(taskId);
      alert("Đã hoàn thành công việc!");
      // (Có thể update UI để disable checkbox)
    } catch (e) {
      alert("Lỗi khi lưu công việc.");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid p-0">
      <h2 className="fw-bold mb-4">Công việc cần làm</h2>

      {tasks.length > 0 ? (
        <>
          <div className="alert alert-info mb-4">
            <i className="bi bi-info-circle me-2"></i>
            Danh sách công việc cho:{" "}
            <strong>{currentShiftName || "Ca hiện tại"}</strong>
          </div>
          <Checklist tasks={tasks} onToggle={handleToggleTask} />
        </>
      ) : (
        <div className="text-center py-5 text-muted bg-white rounded shadow-sm">
          <i className="bi bi-clipboard-check display-1 mb-3 d-block text-secondary"></i>
          <p>Hiện không có checklist nào cho ca làm của bạn.</p>
        </div>
      )}
    </div>
  );
};
