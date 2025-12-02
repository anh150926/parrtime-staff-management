package com.coffee.management.dto.shift;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateShiftRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotNull(message = "Start datetime is required")
    private LocalDateTime startDatetime;
    
    @NotNull(message = "End datetime is required")
    private LocalDateTime endDatetime;
    
    @Min(value = 1, message = "Required slots must be at least 1")
    private Integer requiredSlots = 1;
}








