/*
 * file: backend/src/main/java/com/company/ptsm/dto/communication/AnnouncementDto.java
 *
 * [MỚI]
 * DTO để Manager "Tạo Thông báo" và Staff/Manager "Xem Thông báo".
 * (VAI TRÒ 2, Mục 6).
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
public class AnnouncementDto {
    private Integer id; // Dùng khi trả về

    @NotEmpty(message = "Tiêu đề không được để trống")
    private String title;

    @NotEmpty(message = "Nội dung không được để trống")
    private String content;

    // Trường chỉ đọc (read-only), dùng khi trả về
    private String authorName;
    private OffsetDateTime createdAt;
}