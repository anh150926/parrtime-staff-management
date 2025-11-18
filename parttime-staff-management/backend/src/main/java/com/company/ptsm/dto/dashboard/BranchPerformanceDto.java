/*
 * file: backend/src/main/java/com/company/ptsm/dto/dashboard/BranchPerformanceDto.java
 *
 * [MỚI]
 * DTO con, hiển thị dữ liệu của 1 cơ sở (dùng cho biểu đồ so sánh).
 */
package com.company.ptsm.dto.dashboard;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class BranchPerformanceDto {
    private Integer branchId;
    private String branchName;
    private int staffCount;
    private BigDecimal payrollCost; // Chi phí lương
    private double workHours; // Giờ làm
    private double attendanceRate; // Tỷ lệ chuyên cần
}