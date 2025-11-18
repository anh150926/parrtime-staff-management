/*
 * file: backend/src/main/java/com/company/ptsm/dto/audit/AuditLogDto.java
 *
 * [MỚI]
 * DTO để hiển thị Lịch sử Hoạt động (VAI TRÒ 2, Mục 9).
 */
package com.company.ptsm.dto.audit;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class AuditLogDto {
    private Integer id;
    private Integer userId; // ID của Manager thực hiện
    private String userName; // Tên Manager
    private String action; // "EDIT_TIMESHEET"
    private String targetId; // ID của đối tượng bị sửa
    private String details; // "Sửa giờ check-in..."
    private OffsetDateTime timestamp;
}