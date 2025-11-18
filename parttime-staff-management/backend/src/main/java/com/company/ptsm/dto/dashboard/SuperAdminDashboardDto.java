/*
 * file: backend/src/main/java/com/company/ptsm/dto/dashboard/SuperAdminDashboardDto.java
 *
 * [MỚI]
 * DTO cho VAI TRÒ 1 (Super Admin), Mục 1: "Tổng quan Liên-Cơ sở".
 */
package com.company.ptsm.dto.dashboard;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class SuperAdminDashboardDto {

    // 1. Thống kê tổng hợp (Toàn chuỗi)
    private int totalBranches;
    private int totalManagers;
    private int totalStaff;
    private BigDecimal totalPayrollCostThisMonth; // Tổng chi phí lương tháng này
    private double totalHoursThisMonth; // Tổng giờ làm tháng này

    // 2. So sánh hiệu suất (Biểu đồ)
    private List<BranchPerformanceDto> branchPerformance;
}