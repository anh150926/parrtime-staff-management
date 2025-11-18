package com.company.ptsm.dto.timesheet;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckInRequest {
    @NotNull
    private Integer assignmentId; // ID của ca được phân công
}