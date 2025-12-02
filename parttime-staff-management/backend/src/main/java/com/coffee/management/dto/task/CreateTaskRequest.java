package com.coffee.management.dto.task;

import com.coffee.management.entity.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTaskRequest {
    
    @NotNull(message = "Store ID is required")
    private Long storeId;
    
    private Long shiftId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Priority is required")
    private TaskPriority priority;
    
    private Long assignedToId;
    
    private LocalDateTime dueDate;
    
    private String notes;
}




