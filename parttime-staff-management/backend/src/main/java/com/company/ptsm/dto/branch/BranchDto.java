/*
 * file: backend/src/main/java/com/company/ptsm/dto/branch/BranchDto.java
 *
 * [MỚI]
 * DTO (Data Transfer Object) để hiển thị hoặc tạo/sửa Cơ sở (Branch).
 * Dùng cho VAI TRÒ 1 (Super Admin), Mục 2.
 */
package com.company.ptsm.dto.branch;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchDto {

    private Integer id; // (Chỉ dùng khi trả về)

    @NotEmpty(message = "Tên cơ sở không được để trống")
    private String name; // "Cơ sở 1 (Hoàn Kiếm)"

    private String address;
}