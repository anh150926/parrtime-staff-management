package com.company.ptsm.dto.staff;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

// DTO cho Staff tự cập nhật hồ sơ
@Data
public class StaffProfileUpdateRequest {
    @NotEmpty
    private String phoneNumber;
    @NotEmpty
    @Email
    private String email;
    private String address;

    @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự")
    private String newPassword; // (Nếu null hoặc rỗng, sẽ không đổi)
}