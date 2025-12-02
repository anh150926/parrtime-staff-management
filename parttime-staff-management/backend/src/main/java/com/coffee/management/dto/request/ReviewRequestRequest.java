package com.coffee.management.dto.request;

import com.coffee.management.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequestRequest {
    
    @NotNull(message = "Status is required")
    private RequestStatus status;
    
    @Size(max = 500, message = "Note must not exceed 500 characters")
    private String note;
}








