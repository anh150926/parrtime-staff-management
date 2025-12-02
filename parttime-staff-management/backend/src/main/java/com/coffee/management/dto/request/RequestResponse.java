package com.coffee.management.dto.request;

import com.coffee.management.entity.Request;
import com.coffee.management.entity.RequestStatus;
import com.coffee.management.entity.RequestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestResponse {
    
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long storeId;
    private String storeName;
    private RequestType type;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private String reason;
    private RequestStatus status;
    private Long reviewedById;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String reviewNote;
    private LocalDateTime createdAt;
    
    public static RequestResponse fromEntity(Request request) {
        return RequestResponse.builder()
                .id(request.getId())
                .userId(request.getUser().getId())
                .userName(request.getUser().getFullName())
                .userEmail(request.getUser().getEmail())
                .storeId(request.getUser().getStore() != null ? request.getUser().getStore().getId() : null)
                .storeName(request.getUser().getStore() != null ? request.getUser().getStore().getName() : null)
                .type(request.getType())
                .startDatetime(request.getStartDatetime())
                .endDatetime(request.getEndDatetime())
                .reason(request.getReason())
                .status(request.getStatus())
                .reviewedById(request.getReviewedBy() != null ? request.getReviewedBy().getId() : null)
                .reviewedByName(request.getReviewedBy() != null ? request.getReviewedBy().getFullName() : null)
                .reviewedAt(request.getReviewedAt())
                .reviewNote(request.getReviewNote())
                .createdAt(request.getCreatedAt())
                .build();
    }
}








