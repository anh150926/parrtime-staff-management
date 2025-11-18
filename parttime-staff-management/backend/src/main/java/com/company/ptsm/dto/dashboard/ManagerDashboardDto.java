/*
 * file: backend/src/main/java/com/company/ptsm/dto/dashboard/ManagerDashboardDto.java
 *
 * [MỚI]
 * DTO cho VAI TRÒ 2 (Manager), Mục 1: "Tổng quan (Dashboard)".
 */
package com.company.ptsm.dto.dashboard;

import com.company.ptsm.dto.schedule.ScheduleViewDto;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ManagerDashboardDto {

    // 1. Yêu cầu đang chờ duyệt
    private int pendingLeaveRequests; // (Đơn xin nghỉ)
    private int pendingRegistrations; // (Đăng ký ca)
    private int pendingShiftMarket; // (Chợ ca)

    // 2. Thống kê nhanh (Cơ sở)
    private int totalStaff; // Tổng số NV
    private double totalHoursThisWeek; // Tổng giờ làm tuần này
    private double attendanceRate; // % chuyên cần (Tạm)

    // 3. Việc cần làm hôm nay (Lịch làm của NV trong ngày)
    private List<ScheduleViewDto> todaySchedules;

    // 4. Thông báo mới
    private int unreadAnnouncements;
    private int pendingComplaints; // (Khiếu nại mới)
}