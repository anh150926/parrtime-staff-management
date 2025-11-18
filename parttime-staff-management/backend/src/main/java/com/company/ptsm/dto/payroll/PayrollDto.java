/*
 * file: backend/src/main/java/com/company/ptsm/dto/payroll/PayrollDto.java
 *
 * [CẢI TIẾN - ĐÃ SỬA LỖI]
 * (Đã thêm employeeCode).
 */
package com.company.ptsm.dto.payroll;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class PayrollDto {
    private Integer id;
    private Integer userId;
    private String staffName;
    private String employeeCode; // <-- [SỬA LỖI] THÊM DÒNG NÀY
    private int month;
    private int year;
    private String status;
    private BigDecimal totalWorkHours;
    private Integer totalLateMinutes;
    private BigDecimal basePay;
    private BigDecimal totalBonus;
    private BigDecimal totalPenalty;
    private BigDecimal finalPay;
    private List<PayrollAdjustmentDto> adjustments;
}