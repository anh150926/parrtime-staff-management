package com.company.ptsm.dto.employee;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployeeSearchResponse {
    private Integer id;
    private String name;
    private String phoneNumber;
    private String restaurantName;
}