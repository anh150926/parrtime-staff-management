package com.coffee.management.dto.complaint;

import com.coffee.management.entity.ComplaintType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateComplaintRequest {
    
    @NotNull(message = "Complaint type is required")
    private ComplaintType type;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Content is required")
    private String content;
}



