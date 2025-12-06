package com.coffee.management.dto.shift;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterShiftRequest {
    private Long shiftTemplateId; // ID của ca mẫu
    private LocalDate registrationDate; // Ngày cụ thể đăng ký
}
