package com.coffee.management.dto.shift;

import com.coffee.management.entity.ShiftType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateShiftTemplateRequest {
    private String title;
    private ShiftType shiftType; // MORNING, AFTERNOON, EVENING
    private Integer dayOfWeek; // 1=Monday, 7=Sunday
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer requiredSlots;
    private String notes;
}
