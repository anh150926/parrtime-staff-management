package com.company.ptsm.dto.timesheet;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class WorkLogDto {
    private Integer id;
    private Integer userId;
    private String staffName;
    private OffsetDateTime checkIn;
    private OffsetDateTime checkOut;
    private BigDecimal actualHours;
    private Integer lateMinutes;
    private boolean isEdited;
    private String editReason;
    private String editedByManagerName;
}