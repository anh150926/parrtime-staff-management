package com.coffee.management.dto.shift;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignShiftRequest {
    
    @NotEmpty(message = "At least one user ID is required")
    private List<Long> userIds;
}








