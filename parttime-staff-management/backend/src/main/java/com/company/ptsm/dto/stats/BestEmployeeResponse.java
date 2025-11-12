package com.company.ptsm.dto.stats;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class BestEmployeeResponse {
    private Integer employeeId;
    private String employeeCode;
    private String employeeName;
    private String phoneNumber;
    private BigDecimal totalActualHours;
    private BigDecimal totalPay;
    private Integer totalLateAndEarlyMinutes;
    private BigDecimal totalPenalty;
}