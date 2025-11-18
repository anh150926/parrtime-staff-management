package com.company.ptsm.dto.schedule;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalTime;

@Data
public class ShiftTemplateDto {
    private Integer id;
    @NotEmpty
    private String name; // "Ca Sáng"
    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime endTime;
}