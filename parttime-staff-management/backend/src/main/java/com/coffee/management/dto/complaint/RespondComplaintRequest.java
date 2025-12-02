package com.coffee.management.dto.complaint;

import com.coffee.management.entity.ComplaintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespondComplaintRequest {
    
    @NotNull(message = "Status is required")
    private ComplaintStatus status;
    
    @NotBlank(message = "Response is required")
    private String response;
}



