package com.coffee.management.dto.request;

import com.coffee.management.entity.RequestType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRequestRequest {
    
    @NotNull(message = "Request type is required")
    private RequestType type;
    
    @NotNull(message = "Start datetime is required")
    private LocalDateTime startDatetime;
    
    @NotNull(message = "End datetime is required")
    private LocalDateTime endDatetime;
    
    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;
}








