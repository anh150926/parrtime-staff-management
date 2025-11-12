package com.company.ptsm.dto.availability;

import com.company.ptsm.model.enums.DayOfWeekEnum;
import com.company.ptsm.model.enums.ShiftType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
public class AvailabilityResponse {
    private Integer availabilityId;
    private Integer employeeId;
    private LocalDate weekStartDate;
    private String status;
    private Set<AvailabilitySlotDto> slots;
}