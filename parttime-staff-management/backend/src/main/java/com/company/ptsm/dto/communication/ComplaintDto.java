/*
 * file: backend/src/main/java/com/company/ptsm/dto/communication/ComplaintDto.java
 *
 * [MỚI]
 * DTO để Staff "Gửi Khiếu nại" và Manager "Xem/Phản hồi".
 * (VAI TRÒ 2, Mục 6 & VAI TRÒ 3, Mục 6).
 */
package com.company.ptsm.dto.communication;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDto {
    private Integer id; // Dùng khi trả về

    // Thông tin người gửi (chỉ Manager thấy)
    private Integer staffUserId;
    private String staffName;

    @NotEmpty(message = "Nội dung không được để trống")
    private String content; // Nội dung gửi

    private String response; // Phản hồi của Manager
    private String status; // 'SUBMITTED', 'RESOLVED'
    private OffsetDateTime createdAt;
}