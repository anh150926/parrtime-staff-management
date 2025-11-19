/*
 * file: frontend/src/hooks/useManagerDashboard.ts
 */
import { useState, useEffect, useCallback } from "react";
import { dashboardApi } from "../api/dashboardApi";
import { ManagerDashboardDto } from "../models/Dashboard";
import { useAuth } from "./useAuth";

export const useManagerDashboard = () => {
  const [data, setData] = useState<ManagerDashboardDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { isManager } = useAuth();

  // Hàm gọi API (sử dụng useCallback để tránh tạo lại hàm mỗi lần render)
  const fetchDashboard = useCallback(async () => {
    // Chỉ gọi API nếu user đúng là Manager (tránh lỗi 403)
    if (!isManager) return;

    try {
      setLoading(true);
      setError(null);
      const result = await dashboardApi.getManagerDashboard();
      setData(result);
    } catch (err: any) {
      console.error("Lỗi tải dashboard:", err);
      setError("Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [isManager]);

  // Tự động gọi khi hook được sử dụng (component mount)
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refresh: fetchDashboard, // Trả về hàm này để nút "Làm mới" có thể gọi lại
  };
};
