/*
 * file: backend/src/main/java/com/company/ptsm/exception/BusinessRuleException.java
 *
 * (CẢI TIẾN)
 * Lỗi 400 - Bad Request.
 * Dùng khi người dùng vi phạm một quy tắc nghiệp vụ.
 */
package com.company.ptsm.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) {
        super(message);
    }
}