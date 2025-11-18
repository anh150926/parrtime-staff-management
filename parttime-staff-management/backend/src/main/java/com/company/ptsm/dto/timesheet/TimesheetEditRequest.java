package com.company.ptsm.dto.timesheet;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class TimesheetEditRequest {
    @NotNull
    private OffsetDateTime newCheckIn;
    @NotNull
    private OffsetDateTime newCheckOut;
    @NotEmpty
    private String reason;
}