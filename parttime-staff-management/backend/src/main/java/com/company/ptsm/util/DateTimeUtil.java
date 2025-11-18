/*
 * file: backend/src/main/java/com/company/ptsm/util/DateTimeUtil.java
 *
 * (Giữ nguyên)
 * Lớp tiện ích xử lý các tác vụ liên quan đến Ngày/Giờ.
 */
package com.company.ptsm.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

public class DateTimeUtil {

    /**
     * Lấy ngày Thứ Hai (MONDAY) của tuần chứa ngày được cung cấp.
     * Ví dụ: Nếu input là Thứ 4 (12/11), output sẽ là Thứ 2 (10/11).
     *
     * @param currentDate Ngày bất kỳ
     * @return Ngày Thứ Hai của tuần đó
     */
    public static LocalDate getStartOfWeek(LocalDate currentDate) {
        // Dùng TemporalAdjusters để tìm ngày Thứ Hai (MONDAY)
        // .previousOrSame() đảm bảo nếu hôm nay là Thứ Hai, nó sẽ trả về chính nó
        return currentDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    /**
     * Lấy ngày Chủ Nhật (SUNDAY) của tuần chứa ngày được cung cấp.
     */
    public static LocalDate getEndOfWeek(LocalDate currentDate) {
        return currentDate.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
    }
}