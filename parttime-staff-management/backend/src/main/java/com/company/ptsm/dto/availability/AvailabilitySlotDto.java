package com.company.ptsm.dto.availability;

import com.company.ptsm.model.enums.DayOfWeekEnum;
import com.company.ptsm.model.enums.ShiftType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvailabilitySlotDto {
    @NotNull
    private DayOfWeekEnum dayOfWeek;

    @NotNull
    private ShiftType shiftType;
}