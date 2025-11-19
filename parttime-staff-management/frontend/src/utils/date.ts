/*
 * file: frontend/src/utils/date.ts
 *
 * Các hàm tiện ích để định dạng ngày tháng và giờ.
 * Sử dụng Intl.DateTimeFormat để chuẩn hóa theo vùng Việt Nam (vi-VN).
 */

/**
 * Định dạng ngày: "20/11/2025"
 */
export const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Kiểm tra nếu date không hợp lệ
  if (isNaN(date.getTime())) return dateString.toString();

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

/**
 * Định dạng ngày và giờ: "20/11/2025 08:30"
 */
export const formatDateTime = (dateString?: string | Date | null): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString.toString();

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Dùng hệ 24h
  }).format(date);
};

/**
 * Định dạng giờ: "08:30" (Cắt bỏ giây nếu có)
 */
export const formatTime = (timeString?: string): string => {
  if (!timeString) return "";
  // Nếu chuỗi là "08:00:00", cắt lấy "08:00"
  if (timeString.length >= 5) {
    return timeString.slice(0, 5);
  }
  return timeString;
};

/**
 * Lấy danh sách 7 ngày trong tuần dựa trên ngày bắt đầu
 * (Dùng cho ScheduleCalendar)
 */
export const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  // Copy ngày để không ảnh hưởng biến gốc
  const current = new Date(startDate);

  // Đảm bảo current là Thứ 2 (nếu startDate không phải thứ 2)
  // Logic: Day 0 (Sun) -> 6, Day 1 (Mon) -> 0, ...
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(current.setDate(diff));

  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(day);
  }
  return days;
};

/**
 * Lấy ngày đầu tuần (Thứ 2) dưới dạng chuỗi YYYY-MM-DD
 * (Dùng để gọi API getScheduleForWeek)
 */
export const getStartOfWeekISO = (date: Date = new Date()): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
};
