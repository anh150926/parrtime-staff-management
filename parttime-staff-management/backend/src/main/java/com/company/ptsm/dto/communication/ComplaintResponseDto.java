/*
 * file: backend/src/main/java/com/company/ptsm/dto/communication/ComplaintResponseDto.java
 *
 * [MỚI]
 * DTO riêng cho Manager khi "Phản hồi Khiếu nại".
 */
package com.company.ptsm.dto.communication;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class ComplaintResponseDto {
    @NotEmpty(message = "Phản hồi không được để trống")
    private String response;
}