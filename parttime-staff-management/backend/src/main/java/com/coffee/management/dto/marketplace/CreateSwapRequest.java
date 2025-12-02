package com.coffee.management.dto.marketplace;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSwapRequest {
    
    @NotNull(message = "Your shift ID is required")
    private Long myShiftId;
    
    @NotNull(message = "Target shift ID is required")
    private Long targetShiftId;
    
    @NotNull(message = "Target user ID is required")
    private Long targetUserId;
    
    private String reason;
}




