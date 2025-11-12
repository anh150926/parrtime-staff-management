package com.company.ptsm.dto.schedule;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssignedEmployeeDto {
    private Integer employeeId;
    private String name;
}