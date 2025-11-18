package com.company.ptsm.dto.staff;

import com.company.ptsm.model.enums.EmployeeStatus;
import com.company.ptsm.model.enums.Role;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class StaffProfileDto {
    private Integer userId;
    private String email;
    private Role role;
    private EmployeeStatus status;
    private Integer branchId;
    private String branchName;
    private Integer positionId;
    private String positionName;
    private String employeeCode; // Mã NV (HN1-PC-0001)
    private String fullName;
    private String phoneNumber;
    private BigDecimal baseSalary; // Lương cơ bản (nếu là Manager)
    private String cccd;
    private LocalDate dateOfBirth;
    private String address;
    private String education;
}