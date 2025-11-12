package com.company.ptsm.dto.payroll;

import com.company.ptsm.model.enums.ShiftType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class PayrollDetailResponse {
    private String dayOfWeek;
    private LocalDate shiftDate;
    private ShiftType shift;
    private OffsetDateTime checkIn;
    private OffsetDateTime checkOut;
    private BigDecimal baseHours;
    private BigDecimal overtimeHours;
    private Integer lateAndEarlyMinutes;
    private BigDecimal basePay;
    private BigDecimal overtimePay;
    private BigDecimal penaltyAmount;
    private BigDecimal totalPayForShift;
}