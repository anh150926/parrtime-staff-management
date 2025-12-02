package com.coffee.management.dto.marketplace;

import com.coffee.management.entity.MarketplaceStatus;
import com.coffee.management.entity.MarketplaceType;
import com.coffee.management.entity.ShiftMarketplace;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceListingResponse {
    private Long id;
    private Long shiftId;
    private String shiftTitle;
    private LocalDateTime shiftStart;
    private LocalDateTime shiftEnd;
    private Long storeId;
    private String storeName;
    private MarketplaceType type;
    private MarketplaceStatus status;
    private Long fromUserId;
    private String fromUserName;
    private Long toUserId;
    private String toUserName;
    private String reason;
    private String managerNote;
    private Long reviewedById;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    public static MarketplaceListingResponse fromEntity(ShiftMarketplace listing) {
        return MarketplaceListingResponse.builder()
                .id(listing.getId())
                .shiftId(listing.getShift().getId())
                .shiftTitle(listing.getShift().getTitle())
                .shiftStart(listing.getShift().getStartDatetime())
                .shiftEnd(listing.getShift().getEndDatetime())
                .storeId(listing.getShift().getStore().getId())
                .storeName(listing.getShift().getStore().getName())
                .type(listing.getType())
                .status(listing.getStatus())
                .fromUserId(listing.getFromUser().getId())
                .fromUserName(listing.getFromUser().getFullName())
                .toUserId(listing.getToUser() != null ? listing.getToUser().getId() : null)
                .toUserName(listing.getToUser() != null ? listing.getToUser().getFullName() : null)
                .reason(listing.getReason())
                .managerNote(listing.getManagerNote())
                .reviewedById(listing.getReviewedBy() != null ? listing.getReviewedBy().getId() : null)
                .reviewedByName(listing.getReviewedBy() != null ? listing.getReviewedBy().getFullName() : null)
                .reviewedAt(listing.getReviewedAt())
                .expiresAt(listing.getExpiresAt())
                .createdAt(listing.getCreatedAt())
                .build();
    }
}




