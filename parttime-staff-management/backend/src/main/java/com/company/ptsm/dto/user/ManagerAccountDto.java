package com.company.ptsm.dto.user;

import com.company.ptsm.model.enums.EmployeeStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ManagerAccountDto {
    private Integer userId;
    private String fullName;
    private String email;
    private EmployeeStatus status;
    private Integer branchId;
    private String branchName;
}