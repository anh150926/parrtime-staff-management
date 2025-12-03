package com.coffee.management.dto.task;

import com.coffee.management.entity.TaskPriority;
import com.coffee.management.entity.TaskStatus;
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
    
    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;
    
    private String notes;
    
    @Builder.Default
    private TaskStatus status = TaskStatus.PENDING;
}




