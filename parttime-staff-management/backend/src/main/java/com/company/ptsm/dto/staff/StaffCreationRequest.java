package com.company.ptsm.dto.staff;

import com.company.ptsm.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class StaffCreationRequest {
    @NotEmpty
    @Email
    private String email;

    // Luôn là ROLE_STAFF khi Manager tạo
    private final Role role = Role.ROLE_STAFF;

    @NotNull
    private Integer positionId;
    @NotEmpty
    private String fullName;
    @NotEmpty
    private String phoneNumber;
    private String cccd;
    private LocalDate dateOfBirth;
    private String address;
    private String education;

    // (baseSalary mặc định là 0 cho Staff)
}