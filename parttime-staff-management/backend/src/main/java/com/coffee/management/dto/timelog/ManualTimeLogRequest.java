package com.coffee.management.dto.timelog;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManualTimeLogRequest {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    private Long shiftId;
    
    @NotNull(message = "Check-in time is required")
    private LocalDateTime checkIn;
    
    @NotNull(message = "Check-out time is required")
    private LocalDateTime checkOut;
}








