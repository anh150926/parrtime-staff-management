package com.company.ptsm.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotEmpty(message = "Tên không được để trống")
    private String name;

    @NotEmpty(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    @Email(message = "Email không đúng định dạng")
    @NotEmpty(message = "Email không được để trống")
    private String email;

    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @NotEmpty(message = "Mật khẩu không được để trống")
    private String password;

    @NotNull(message = "ID nhà hàng không được để trống")
    private Integer restaurantId;
}