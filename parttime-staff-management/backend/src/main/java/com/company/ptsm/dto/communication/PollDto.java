/*
 * file: backend/src/main/java/com/company/ptsm/dto/communication/PollDto.java
 *
 * [MỚI]
 * DTO cho Manager "Tạo Khảo sát" (VAI TRÒ 2, Mục 6).
 */
package com.company.ptsm.dto.communication;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PollDto {

    @NotEmpty(message = "Câu hỏi khảo sát không được để trống")
    private String question;

    @NotEmpty(message = "Phải có ít nhất 2 lựa chọn")
    @Size(min = 2, message = "Phải có ít nhất 2 lựa chọn")
    private String[] options; // Mảng các lựa chọn
}