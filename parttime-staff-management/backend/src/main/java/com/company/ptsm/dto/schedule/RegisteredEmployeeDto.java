package com.company.ptsm.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisteredEmployeeDto {
    private Integer employeeId;
    private String name;
    private String phoneNumber;
    private long totalShiftsScheduled;
}