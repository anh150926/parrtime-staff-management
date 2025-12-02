package com.coffee.management.dto.marketplace;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimMarketplaceRequest {
    
    @NotNull(message = "Listing ID is required")
    private Long listingId;
    
    private String note;
}




