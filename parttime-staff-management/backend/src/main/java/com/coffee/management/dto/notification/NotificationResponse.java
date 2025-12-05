package com.coffee.management.dto.notification;

import com.coffee.management.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private Boolean isRead;
    private String link;
    private String attachmentUrl;
    private String attachmentName;
    private LocalDateTime createdAt;
    
    public static NotificationResponse fromEntity(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .link(notification.getLink())
                .attachmentUrl(notification.getAttachmentUrl())
                .attachmentName(notification.getAttachmentName())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}








