/*
 * file: frontend/src/hooks/useDebounce.ts
 */
import { useState, useEffect } from "react";

/**
 * @param value Giá trị cần theo dõi (ví dụ: từ khóa tìm kiếm)
 * @param delay Thời gian trì hoãn tính bằng ms (ví dụ: 500)
 * @returns Giá trị đã được debounce
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State lưu trữ giá trị đã debounce
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Thiết lập timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: Xóa timer nếu value thay đổi trước khi hết thời gian delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Chạy lại khi value hoặc delay thay đổi

  return debouncedValue;
}
