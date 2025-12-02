package com.coffee.management.dto.notification;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BroadcastNotificationRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    private String link;
    
    // null = all stores (for Owner), for Manager this will be their store
    private Long storeId;
    
    // Optional: filter by role (STAFF, MANAGER)
    private String targetRole;

    // Explicit getters for IDE recognition (Lombok @Data also generates these)
    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getLink() {
        return link;
    }

    public Long getStoreId() {
        return storeId;
    }

    public String getTargetRole() {
        return targetRole;
    }
}



