/*
 * file: backend/src/main/java/com/company/ptsm/dto/user/ManagerCreationRequest.java
 *
 * [CẢI TIẾN - ĐÃ SỬA LỖI]
 * (Đã thêm positionId).
 */
package com.company.ptsm.dto.user;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ManagerCreationRequest {

    @NotEmpty
    @Email
    private String email;
    @NotNull
    private Integer branchId;

    @NotNull // <-- [SỬA LỖI] THÊM DÒNG NÀY
    private Integer positionId; // <-- [SỬA LỖI] THÊM DÒNG NÀY

    @NotEmpty
    private String fullName;
    @NotEmpty
    private String phoneNumber;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal baseSalary; // Lương cố định

    private String cccd;
    private LocalDate dateOfBirth;
}