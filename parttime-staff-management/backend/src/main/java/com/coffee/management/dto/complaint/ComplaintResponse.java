package com.coffee.management.dto.complaint;

import com.coffee.management.entity.Complaint;
import com.coffee.management.entity.ComplaintStatus;
import com.coffee.management.entity.ComplaintType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {
    private Long id;
    private Long storeId;
    private String storeName;
    private Long fromUserId;
    private String fromUserName;
    private ComplaintType type;
    private String subject;
    private String content;
    private ComplaintStatus status;
    private String response;
    private Long respondedById;
    private String respondedByName;
    private LocalDateTime respondedAt;
    private LocalDateTime createdAt;

    public static ComplaintResponse fromEntity(Complaint complaint) {
        return ComplaintResponse.builder()
                .id(complaint.getId())
                .storeId(complaint.getStore().getId())
                .storeName(complaint.getStore().getName())
                .fromUserId(complaint.getFromUser().getId())
                .fromUserName(complaint.getFromUser().getFullName())
                .type(complaint.getType())
                .subject(complaint.getSubject())
                .content(complaint.getContent())
                .status(complaint.getStatus())
                .response(complaint.getResponse())
                .respondedById(complaint.getRespondedBy() != null ? complaint.getRespondedBy().getId() : null)
                .respondedByName(complaint.getRespondedBy() != null ? complaint.getRespondedBy().getFullName() : null)
                .respondedAt(complaint.getRespondedAt())
                .createdAt(complaint.getCreatedAt())
                .build();
    }
}



