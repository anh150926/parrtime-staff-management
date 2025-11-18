/*
 * file: backend/src/main/java/com/company/ptsm/dto/operations/TaskLogDto.java
 *
 * [MỚI]
 * DTO để Staff gửi log "Đã hoàn thành" (VAI TRÒ 3, Mục 7).
 */
package com.company.ptsm.dto.operations;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskLogDto {
    private Integer id;
    private Integer taskId;

    // Thông tin người hoàn thành (dùng khi xem log)
    private Integer userId;
    private String staffName;
    private OffsetDateTime completedAt;
}