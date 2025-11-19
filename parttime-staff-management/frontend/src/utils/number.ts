/*
 * file: frontend/src/utils/number.ts
 *
 * Các hàm tiện ích để định dạng số và tiền tệ.
 */

/**
 * Định dạng tiền Việt Nam: "15.000.000 ₫"
 */
export const formatCurrency = (amount?: number | string | null): string => {
  if (amount === undefined || amount === null) return "0 ₫";

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 ₫";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

/**
 * Định dạng số thông thường: "1,234" (Dùng cho số lượng nhân viên...)
 */
export const formatNumber = (num?: number | string | null): string => {
  if (num === undefined || num === null) return "0";

  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "0";

  return new Intl.NumberFormat("vi-VN").format(n);
};
