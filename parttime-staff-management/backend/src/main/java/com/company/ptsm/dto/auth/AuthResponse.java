/*
 * file: backend/src/main/java/com/company/ptsm/dto/auth/AuthResponse.java
 *
 * (CẢI TIẾN)
 * Dữ liệu trả về sau khi đăng nhập thành công.
 * Trả về Role, fullName (từ profile) và branchId (nếu có).
 */
package com.company.ptsm.dto.auth;

import com.company.ptsm.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token; // JWT Token
    private Integer id;
    private String email;
    private Role role;

    // Thông tin bổ sung
    private String fullName; // Lấy từ StaffProfile (nếu là Manager/Staff)
    private Integer branchId; // ID cơ sở (nếu là Manager/Staff)
}