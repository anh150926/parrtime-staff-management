package com.coffee.management.dto.shift;

import com.coffee.management.entity.AssignmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAssignmentRequest {

    @NotNull(message = "Status is required")
    private AssignmentStatus status;
}







