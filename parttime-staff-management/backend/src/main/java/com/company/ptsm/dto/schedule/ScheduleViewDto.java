package com.company.ptsm.dto.schedule;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class ScheduleViewDto {
    private Integer scheduleId;
    private String shiftName;
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private int requiredStaff;
    private int assignedStaffCount;
    private List<AssignedStaffDto> assignedStaff;
}