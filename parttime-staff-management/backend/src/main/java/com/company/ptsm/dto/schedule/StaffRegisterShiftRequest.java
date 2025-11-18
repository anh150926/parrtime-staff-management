package com.company.ptsm.dto.schedule;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StaffRegisterShiftRequest {
    @NotNull
    private Integer scheduleId; // ID của ca trống
}