/*
 * file: backend/src/main/java/com/company/ptsm/dto/dashboard/StaffDashboardDto.java
 *
 * [MỚI]
 * DTO cho VAI TRÒ 3 (Staff), Mục 1: "Trang chủ (My Dashboard)".
 */
package com.company.ptsm.dto.dashboard;

import com.company.ptsm.dto.schedule.ScheduleAssignmentDto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StaffDashboardDto {

    // 1. Ca làm việc Sắp tới
    private ScheduleAssignmentDto upcomingShift; // (Hiển thị ca làm gần nhất)

    // 2. Trạng thái Yêu cầu
    private int pendingLeaveRequests; // (Số lượng đơn xin nghỉ đang chờ)
    private int pendingShiftMarketRequests; // (Số lượng ca đang bán/chờ duyệt)

    // 3. Thông báo mới
    private int unreadAnnouncements; // (Số lượng thông báo mới)
}