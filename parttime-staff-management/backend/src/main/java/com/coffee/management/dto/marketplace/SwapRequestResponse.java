package com.coffee.management.dto.marketplace;

import com.coffee.management.entity.ShiftSwapRequest;
import com.coffee.management.entity.SwapStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SwapRequestResponse {
    private Long id;
    
    // From shift info
    private Long fromShiftId;
    private String fromShiftTitle;
    private LocalDateTime fromShiftStart;
    private LocalDateTime fromShiftEnd;
    
    // To shift info
    private Long toShiftId;
    private String toShiftTitle;
    private LocalDateTime toShiftStart;
    private LocalDateTime toShiftEnd;
    
    // User info
    private Long fromUserId;
    private String fromUserName;
    private Long toUserId;
    private String toUserName;
    
    // Store info
    private Long storeId;
    private String storeName;
    
    private SwapStatus status;
    private String reason;
    private Boolean peerConfirmed;
    private Long reviewedById;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;

    public static SwapRequestResponse fromEntity(ShiftSwapRequest request) {
        return SwapRequestResponse.builder()
                .id(request.getId())
                .fromShiftId(request.getFromAssignment().getShift().getId())
                .fromShiftTitle(request.getFromAssignment().getShift().getTitle())
                .fromShiftStart(request.getFromAssignment().getShift().getStartDatetime())
                .fromShiftEnd(request.getFromAssignment().getShift().getEndDatetime())
                .toShiftId(request.getToAssignment().getShift().getId())
                .toShiftTitle(request.getToAssignment().getShift().getTitle())
                .toShiftStart(request.getToAssignment().getShift().getStartDatetime())
                .toShiftEnd(request.getToAssignment().getShift().getEndDatetime())
                .fromUserId(request.getFromUser().getId())
                .fromUserName(request.getFromUser().getFullName())
                .toUserId(request.getToUser().getId())
                .toUserName(request.getToUser().getFullName())
                .storeId(request.getFromAssignment().getShift().getStore().getId())
                .storeName(request.getFromAssignment().getShift().getStore().getName())
                .status(request.getStatus())
                .reason(request.getReason())
                .peerConfirmed(request.getPeerConfirmed())
                .reviewedById(request.getReviewedBy() != null ? request.getReviewedBy().getId() : null)
                .reviewedByName(request.getReviewedBy() != null ? request.getReviewedBy().getFullName() : null)
                .reviewedAt(request.getReviewedAt())
                .createdAt(request.getCreatedAt())
                .build();
    }
}




