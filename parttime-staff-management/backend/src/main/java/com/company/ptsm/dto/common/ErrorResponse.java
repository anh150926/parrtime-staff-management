package com.company.ptsm.dto.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor // <-- Sửa lỗi "required: no arguments"
public class ErrorResponse {
    private int statusCode;
    private OffsetDateTime timestamp;
    private String message;
    private String path;
}