package com.coffee.management.dto.shift;

import com.coffee.management.entity.Shift;
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
public class ShiftTemplateResponse {
    private Long id;
    private Long storeId;
    private String storeName;
    private String title;
    private ShiftType shiftType;
    private Integer dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer requiredSlots;
    private Long createdById;
    private String createdByName;

    public static ShiftTemplateResponse fromEntity(Shift shift) {
        LocalTime startTime = shift.getStartDatetime() != null ? 
                shift.getStartDatetime().toLocalTime() : null;
        LocalTime endTime = shift.getEndDatetime() != null ? 
                shift.getEndDatetime().toLocalTime() : null;

        return ShiftTemplateResponse.builder()
                .id(shift.getId())
                .storeId(shift.getStore() != null ? shift.getStore().getId() : null)
                .storeName(shift.getStore() != null ? shift.getStore().getName() : null)
                .title(shift.getTitle())
                .shiftType(shift.getShiftType())
                .dayOfWeek(shift.getDayOfWeek())
                .startTime(startTime)
                .endTime(endTime)
                .requiredSlots(shift.getRequiredSlots())
                .createdById(shift.getCreatedBy() != null ? shift.getCreatedBy().getId() : null)
                .createdByName(shift.getCreatedBy() != null ? shift.getCreatedBy().getFullName() : null)
                .build();
    }
}
