package com.company.ptsm.dto.schedule;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class StaffAvailabilityDto {
    private Integer id;
    @NotNull
    @FutureOrPresent
    private OffsetDateTime startTime;
    @NotNull
    @FutureOrPresent
    private OffsetDateTime endTime;
    @NotEmpty
    private String reason; // "Lịch học"
}