package com.coffee.management.dto.marketplace;

import com.coffee.management.entity.MarketplaceType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMarketplaceListingRequest {
    
    @NotNull(message = "Shift ID is required")
    private Long shiftId;
    
    @NotNull(message = "Type is required")
    private MarketplaceType type;
    
    private String reason;
}




