package com.company.ptsm.dto.schedule;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class ScheduleAssignmentDto {
    private Integer assignmentId;
    private String status;
    private Integer userId;
    private String staffName;
    private Integer scheduleId;
    private String shiftName;
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
}