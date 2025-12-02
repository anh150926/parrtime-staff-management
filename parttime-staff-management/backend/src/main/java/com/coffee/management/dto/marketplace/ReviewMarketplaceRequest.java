package com.coffee.management.dto.marketplace;

import com.coffee.management.entity.MarketplaceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewMarketplaceRequest {
    
    @NotNull(message = "Status is required")
    private MarketplaceStatus status;
    
    private String note;
}




