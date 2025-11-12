package com.company.ptsm.dto.worklog;

import com.company.ptsm.model.enums.ShiftType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class WorkLogResponse {
    private Integer workLogId;
    private Integer employeeId;
    private String employeeName;
    private OffsetDateTime checkIn;
    private OffsetDateTime checkOut;
    private LocalDate shiftDate;
    private ShiftType shiftType;
    private BigDecimal actualHours;
    private BigDecimal baseHours;
    private BigDecimal overtimeHours;
    private Integer lateMinutes;
    private Integer earlyLeaveMinutes;
}