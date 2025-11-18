package com.company.ptsm.dto.schedule;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssignedStaffDto {
    private Integer userId;
    private String fullName;
    private String status; // PENDING, CONFIRMED
}