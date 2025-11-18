package com.company.ptsm.dto.common;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

// Dùng cho Manager khi Duyệt/Từ chối
@Data
public class ApprovalDto {
    @NotNull
    private boolean approved; // true = Đồng ý, false = Từ chối
    private String reason; // (Tùy chọn) Lý do từ chối
}