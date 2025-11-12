package com.company.ptsm.dto.stats;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class StatsRequest {
    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;
}