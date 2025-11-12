package com.company.ptsm.dto.schedule;

import com.company.ptsm.model.enums.DayOfWeekEnum;
import com.company.ptsm.model.enums.ShiftType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class AssignShiftRequest {
    @NotNull
    private Integer restaurantId;
    @NotNull
    @FutureOrPresent
    private LocalDate weekStartDate;
    @NotNull
    private DayOfWeekEnum dayOfWeek;
    @NotNull
    private ShiftType shiftType;
    @NotNull
    private List<Integer> selectedEmployeeIds;
}