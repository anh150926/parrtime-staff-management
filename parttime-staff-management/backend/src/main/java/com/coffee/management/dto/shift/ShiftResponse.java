package com.coffee.management.dto.shift;

import com.coffee.management.entity.Shift;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftResponse {
    
    private Long id;
    private Long storeId;
    private String storeName;
    private String title;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private Integer requiredSlots;
    private int assignedCount;
    private int confirmedCount;
    private Long createdById;
    private String createdByName;
    private List<ShiftAssignmentResponse> assignments;
    private LocalDateTime createdAt;
    
    public static ShiftResponse fromEntity(Shift shift) {
        return ShiftResponse.builder()
                .id(shift.getId())
                .storeId(shift.getStore().getId())
                .storeName(shift.getStore().getName())
                .title(shift.getTitle())
                .startDatetime(shift.getStartDatetime())
                .endDatetime(shift.getEndDatetime())
                .requiredSlots(shift.getRequiredSlots())
                .assignedCount(shift.getAssignments() != null ? shift.getAssignments().size() : 0)
                .confirmedCount(shift.getAssignments() != null ? 
                        (int) shift.getAssignments().stream()
                                .filter(a -> a.getStatus().name().equals("CONFIRMED"))
                                .count() : 0)
                .createdById(shift.getCreatedBy() != null ? shift.getCreatedBy().getId() : null)
                .createdByName(shift.getCreatedBy() != null ? shift.getCreatedBy().getFullName() : null)
                .assignments(shift.getAssignments() != null ?
                        shift.getAssignments().stream()
                                .map(ShiftAssignmentResponse::fromEntity)
                                .collect(Collectors.toList()) : null)
                .createdAt(shift.getCreatedAt())
                .build();
    }
}








