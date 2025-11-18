/*
 * file: backend/src/main/java/com/company/ptsm/dto/operations/KnowledgeArticleDto.java
 *
 * [MỚI]
 * DTO cho "Sổ tay Vận hành" (VAI TRÒ 2, Mục 7 & VAI TRÒ 3, Mục 7).
 */
package com.company.ptsm.dto.operations;

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
public class KnowledgeArticleDto {
    private Integer id; // Dùng khi trả về

    @NotEmpty(message = "Tiêu đề không được để trống")
    private String title;

    @NotEmpty(message = "Nội dung không được để trống")
    private String content;

    private String category;

    // Các trường chỉ đọc (read-only), dùng khi trả về
    private String authorName;
    private OffsetDateTime createdAt;
}