/*
 * file: backend/src/main/java/com/company/ptsm/dto/payroll/PayrollAdjustmentDto.java
 *
 * [CẢI TIẾN - ĐÃ SỬA LỖI]
 * (Sửa String type thành AdjustmentType type).
 */
package com.company.ptsm.dto.payroll;

import com.company.ptsm.model.enums.AdjustmentType; // <-- [SỬA LỖI] THÊM IMPORT NÀY
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class PayrollAdjustmentDto {
    private Integer id;
    private AdjustmentType type; // <-- [SỬA LỖI] ĐỔI TỪ String
    private BigDecimal amount;
    private String reason;
    private OffsetDateTime createdAt;
    private String managerName;
}