package com.company.ptsm.dto.availability;

import com.company.ptsm.model.enums.DayOfWeekEnum;
import com.company.ptsm.model.enums.ShiftType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.Set;

@Data
public class AvailabilityRequest {
    @NotNull
    private Integer employeeId;

    @NotNull
    @FutureOrPresent(message = "Không thể đăng ký cho tuần trong quá khứ")
    private LocalDate weekStartDate;

    private Set<AvailabilitySlotDto> slots;
}