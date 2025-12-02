package com.coffee.management.dto.task;

import com.coffee.management.entity.Task;
import com.coffee.management.entity.TaskPriority;
import com.coffee.management.entity.TaskStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {
    private Long id;
    private Long storeId;
    private String storeName;
    private Long shiftId;
    private String shiftTitle;
    private LocalDateTime shiftStart;
    private String title;
    private String description;
    private TaskPriority priority;
    private TaskStatus status;
    private Long assignedToId;
    private String assignedToName;
    private LocalDateTime dueDate;
    private LocalDateTime completedAt;
    private Long completedById;
    private String completedByName;
    private Long createdById;
    private String createdByName;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isOverdue;

    public static TaskResponse fromEntity(Task task) {
        TaskResponseBuilder builder = TaskResponse.builder()
                .id(task.getId())
                .storeId(task.getStore().getId())
                .storeName(task.getStore().getName())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .completedAt(task.getCompletedAt())
                .notes(task.getNotes())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt());

        if (task.getShift() != null) {
            builder.shiftId(task.getShift().getId())
                   .shiftTitle(task.getShift().getTitle())
                   .shiftStart(task.getShift().getStartDatetime());
        }

        if (task.getAssignedTo() != null) {
            builder.assignedToId(task.getAssignedTo().getId())
                   .assignedToName(task.getAssignedTo().getFullName());
        }

        if (task.getCompletedBy() != null) {
            builder.completedById(task.getCompletedBy().getId())
                   .completedByName(task.getCompletedBy().getFullName());
        }

        if (task.getCreatedBy() != null) {
            builder.createdById(task.getCreatedBy().getId())
                   .createdByName(task.getCreatedBy().getFullName());
        }

        // Calculate overdue status
        boolean overdue = task.getDueDate() != null 
                && task.getDueDate().isBefore(LocalDateTime.now())
                && (task.getStatus() == TaskStatus.PENDING || task.getStatus() == TaskStatus.IN_PROGRESS);
        builder.isOverdue(overdue);

        return builder.build();
    }
}




