package com.coffee.management.dto.task;

import com.coffee.management.entity.TaskPriority;
import com.coffee.management.entity.TaskStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTaskRequest {
    private String title;
    private String description;
    private TaskPriority priority;
    private TaskStatus status;
    private Long assignedToId;
    private LocalDateTime dueDate;
    private String notes;
}




