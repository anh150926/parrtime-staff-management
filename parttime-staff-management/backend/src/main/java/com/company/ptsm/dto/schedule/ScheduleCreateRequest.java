package com.company.ptsm.dto.schedule;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ScheduleCreateRequest {
    @NotNull
    private Integer shiftTemplateId;
    @NotNull
    @FutureOrPresent
    private LocalDate scheduleDate;
    @NotNull
    @Min(value = 1)
    private int requiredStaff; // Cần bao nhiêu người
}