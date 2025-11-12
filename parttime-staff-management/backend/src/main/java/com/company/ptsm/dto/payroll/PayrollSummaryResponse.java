package com.company.ptsm.dto.payroll;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PayrollSummaryResponse {
    private Integer payrollId;
    private Integer employeeId;
    private String employeeCode;
    private String employeeName;
    private String phoneNumber;
    private BigDecimal totalBaseHours;
    private BigDecimal totalOvertimeHours;
    private Integer totalLateAndEarlyMinutes;
    private BigDecimal basePay;
    private BigDecimal overtimePay;
    private BigDecimal totalPenalty;
    private BigDecimal finalPay;
}