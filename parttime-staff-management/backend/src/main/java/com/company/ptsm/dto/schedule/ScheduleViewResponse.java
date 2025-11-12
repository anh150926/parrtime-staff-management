package com.company.ptsm.dto.schedule;

import com.company.ptsm.model.enums.ScheduleStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ScheduleViewResponse {
    private Integer scheduleId;
    private Integer restaurantId;
    private LocalDate weekStartDate;
    private ScheduleStatus status;
    private Map<String, List<AssignedEmployeeDto>> shiftAssignments;
}