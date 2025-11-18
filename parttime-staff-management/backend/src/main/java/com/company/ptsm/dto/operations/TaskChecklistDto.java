/*
 * file: backend/src/main/java/com/company/ptsm/dto/operations/TaskChecklistDto.java
 *
 * [MỚI]
 * DTO để Manager tạo/xem "Checklist Công việc" (VAI TRÒ 2, Mục 7).
 */
package com.company.ptsm.dto.operations;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskChecklistDto {
    private Integer id; // Dùng khi trả về

    @NotNull(message = "ID Mẫu ca không được để trống")
    private Integer shiftTemplateId; // Gán cho "Ca Sáng", "Ca Tối"...

    @NotEmpty(message = "Mô tả công việc không được để trống")
    private String taskDescription; // "Vệ sinh máy pha cà phê"

    private boolean isActive;

    // Trường chỉ đọc (read-only), dùng khi trả về
    private String shiftTemplateName;
}