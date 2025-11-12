package com.company.ptsm.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class AuthRequest {
    @Email(message = "Email không đúng định dạng")
    @NotEmpty(message = "Email không được để trống")
    private String email;

    @NotEmpty(message = "Mật khẩu không được để trống")
    private String password;
}