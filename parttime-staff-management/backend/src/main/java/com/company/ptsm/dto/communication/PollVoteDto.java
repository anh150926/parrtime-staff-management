/*
 * file: backend/src/main/java/com/company/ptsm/dto/communication/PollVoteDto.java
 *
 * [MỚI]
 * DTO cho Staff "Bỏ phiếu" (VAI TRÒ 3, Mục 8).
 */
package com.company.ptsm.dto.communication;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class PollVoteDto {
    @NotEmpty(message = "Lựa chọn không được để trống")
    private String selectedOption;
}