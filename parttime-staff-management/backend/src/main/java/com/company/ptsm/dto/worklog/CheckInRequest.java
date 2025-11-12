package com.company.ptsm.dto.worklog;

import com.company.ptsm.model.enums.ShiftType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CheckInRequest {
    @NotNull
    private Integer employeeId;

    @NotNull
    private LocalDate shiftDate;

    @NotNull
    private ShiftType shiftType;
}