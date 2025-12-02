package com.coffee.management.dto.shift;

import com.coffee.management.entity.AssignmentStatus;
import com.coffee.management.entity.ShiftAssignment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftAssignmentResponse {
    
    private Long id;
    private Long shiftId;
    private Long userId;
    private String userName;
    private String userEmail;
    private AssignmentStatus status;
    private LocalDateTime assignedAt;
    
    public static ShiftAssignmentResponse fromEntity(ShiftAssignment assignment) {
        return ShiftAssignmentResponse.builder()
                .id(assignment.getId())
                .shiftId(assignment.getShift().getId())
                .userId(assignment.getUser().getId())
                .userName(assignment.getUser().getFullName())
                .userEmail(assignment.getUser().getEmail())
                .status(assignment.getStatus())
                .assignedAt(assignment.getAssignedAt())
                .build();
    }
}








