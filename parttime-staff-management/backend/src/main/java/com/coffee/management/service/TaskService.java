package com.coffee.management.service;

import com.coffee.management.dto.task.*;
import com.coffee.management.entity.*;
import com.coffee.management.exception.BadRequestException;
import com.coffee.management.exception.ForbiddenException;
import com.coffee.management.exception.ResourceNotFoundException;
import com.coffee.management.repository.*;
import com.coffee.management.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for task management operations
 */
@Service
@Transactional
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    /**
     * Get tasks by store
     */
    public List<TaskResponse> getTasksByStore(Long storeId, UserPrincipal currentUser) {
        // Validate access
        if (currentUser.getRole().equals("MANAGER") && !storeId.equals(currentUser.getStoreId())) {
            throw new ForbiddenException("You can only view tasks for your store");
        }

        return taskRepository.findByStoreIdOrderByDueDateAsc(storeId)
                .stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get tasks by shift
     */
    public List<TaskResponse> getTasksByShift(Long shiftId) {
        return taskRepository.findByShiftIdOrderByPriorityDescDueDateAsc(shiftId)
                .stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all tasks (including completed) assigned to current user or unassigned tasks in their store
     */
    public List<TaskResponse> getMyTasks(Long userId, Long storeId) {
        return taskRepository.findAllTasksForUserOrStore(userId, storeId)
                .stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get today's tasks for a store
     */
    public List<TaskResponse> getTodaysTasks(Long storeId) {
        return taskRepository.findTasksDueToday(storeId, LocalDateTime.now())
                .stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get overdue tasks for a store
     */
    public List<TaskResponse> getOverdueTasks(Long storeId) {
        return taskRepository.findOverdueTasks(storeId, LocalDateTime.now())
                .stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get task by ID
     */
    public TaskResponse getTaskById(Long id, UserPrincipal currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // Validate access
        if (currentUser.getRole().equals("STAFF")) {
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You can only view tasks assigned to you");
            }
        } else if (currentUser.getRole().equals("MANAGER")) {
            if (!task.getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only view tasks for your store");
            }
        }

        return TaskResponse.fromEntity(task);
    }

    /**
     * Create a new task
     */
    public TaskResponse createTask(CreateTaskRequest request, UserPrincipal currentUser) {
        // Validate store access
        if (currentUser.getRole().equals("MANAGER") && !request.getStoreId().equals(currentUser.getStoreId())) {
            throw new ForbiddenException("You can only create tasks for your store");
        }

        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", request.getStoreId()));

        User creator = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        Task task = Task.builder()
                .store(store)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.PENDING)
                .dueDate(request.getDueDate())
                .notes(request.getNotes())
                .createdBy(creator)
                .build();

        // Optional: link to shift
        if (request.getShiftId() != null) {
            Shift shift = shiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", request.getShiftId()));
            task.setShift(shift);
        }

        // Optional: assign to user
        if (request.getAssignedToId() != null) {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToId()));
            
            // Validate assignee is in same store
            if (assignee.getStore() == null || !assignee.getStore().getId().equals(store.getId())) {
                throw new BadRequestException("Assignee must belong to the same store");
            }
            
            task.setAssignedTo(assignee);

            // Notify assignee
            notificationService.sendNotification(assignee.getId(),
                    "Nhiệm vụ mới",
                    "Bạn được giao nhiệm vụ: " + task.getTitle(),
                    "/tasks");
        }

        Task saved = taskRepository.save(task);

        auditService.log(currentUser.getId(), "CREATE", "TASK", saved.getId(),
                "Created task: " + task.getTitle());

        return TaskResponse.fromEntity(saved);
    }

    /**
     * Update a task
     */
    public TaskResponse updateTask(Long id, UpdateTaskRequest request, UserPrincipal currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // Validate access - only task creator can update
        if (currentUser.getRole().equals("MANAGER") && !task.getStore().getId().equals(currentUser.getStoreId())) {
            throw new ForbiddenException("You can only update tasks for your store");
        }
        
        // Only the creator can update the task
        if (task.getCreatedBy() != null && !task.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Chỉ người tạo nhiệm vụ mới có quyền sửa nhiệm vụ này");
        }

        // Track changes for notification
        List<String> changedFields = new ArrayList<>();
        
        // Save old values and track changes
        String oldTitle = task.getTitle();
        String oldDescription = task.getDescription();
        TaskPriority oldPriority = task.getPriority();
        LocalDateTime oldDueDate = task.getDueDate();
        String oldNotes = task.getNotes();
        User previousAssignee = task.getAssignedTo();
        boolean assigneeChanged = false;

        if (request.getTitle() != null && !request.getTitle().equals(oldTitle)) {
            task.setTitle(request.getTitle());
            changedFields.add("Tiêu đề");
        }
        if (request.getDescription() != null && !request.getDescription().equals(oldDescription)) {
            task.setDescription(request.getDescription());
            changedFields.add("Mô tả");
        }
        if (request.getPriority() != null && request.getPriority() != oldPriority) {
            task.setPriority(request.getPriority());
            changedFields.add("Độ ưu tiên");
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
            
            // Mark completion
            if (request.getStatus() == TaskStatus.COMPLETED && task.getCompletedAt() == null) {
                task.setCompletedAt(LocalDateTime.now());
                User completedBy = userRepository.findById(currentUser.getId()).orElse(null);
                task.setCompletedBy(completedBy);
            }
        }
        if (request.getDueDate() != null && (oldDueDate == null || !request.getDueDate().equals(oldDueDate))) {
            task.setDueDate(request.getDueDate());
            changedFields.add("Hạn hoàn thành");
        }
        if (request.getNotes() != null && !request.getNotes().equals(oldNotes)) {
            task.setNotes(request.getNotes());
            changedFields.add("Ghi chú");
        }

        if (request.getAssignedToId() != null) {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToId()));
            
            // Notify new assignee if changed
            if (previousAssignee == null || !previousAssignee.getId().equals(assignee.getId())) {
                notificationService.sendNotification(assignee.getId(),
                        "Nhiệm vụ mới",
                        "Bạn được giao nhiệm vụ: " + task.getTitle(),
                        "/tasks");
                assigneeChanged = true;
                changedFields.add("Người được giao");
            }
            
            task.setAssignedTo(assignee);
        }

        Task updated = taskRepository.save(task);

        // Notify current assignee about task update with changed fields (if not changing assignee)
        if (!assigneeChanged && task.getAssignedTo() != null && !changedFields.isEmpty()) {
            String changedFieldsText = String.join(", ", changedFields);
            notificationService.sendNotification(task.getAssignedTo().getId(),
                    "Nhiệm vụ đã bị thay đổi",
                    "Nhiệm vụ \"" + task.getTitle() + "\" đã thay đổi: " + changedFieldsText,
                    "/tasks");
        }

        return TaskResponse.fromEntity(updated);
    }

    /**
     * Start working on a task (for staff)
     */
    public TaskResponse startTask(Long id, UserPrincipal currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // Validate staff can only start tasks assigned to them or general tasks (assignedToId = null)
        if (currentUser.getRole().equals("STAFF")) {
            if (task.getAssignedTo() != null && !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You can only start tasks assigned to you");
            }
            // If task has no specific assignee (assignedToId = null), any staff in the same store can start it
            if (task.getStore().getId() == null || !task.getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only start tasks from your store");
            }
        }

        if (task.getStatus() != TaskStatus.PENDING) {
            throw new BadRequestException("Only pending tasks can be started");
        }

        // Check if task is overdue
        if (task.getDueDate() != null && task.getDueDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot start an overdue task");
        }

        task.setStatus(TaskStatus.IN_PROGRESS);
        
        // If task was assigned to all staff, now assign to the one who started it
        if (task.getAssignedTo() == null) {
            User staff = userRepository.findById(currentUser.getId()).orElse(null);
            task.setAssignedTo(staff);
        }

        Task updated = taskRepository.save(task);

        auditService.log(currentUser.getId(), "START", "TASK", id,
                "Started task: " + task.getTitle());

        return TaskResponse.fromEntity(updated);
    }

    /**
     * Mark task as completed by staff
     */
    public TaskResponse completeTask(Long id, UserPrincipal currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // Validate staff can only complete tasks assigned to them or general tasks (assignedToId = null)
        if (currentUser.getRole().equals("STAFF")) {
            if (task.getAssignedTo() != null && !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You can only complete tasks assigned to you");
            }
            // If task has no specific assignee (assignedToId = null), any staff in the same store can complete it
            if (task.getStore().getId() == null || !task.getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only complete tasks from your store");
            }
        }

        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new BadRequestException("Task is already completed");
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());
        
        User completedBy = userRepository.findById(currentUser.getId()).orElse(null);
        task.setCompletedBy(completedBy);

        Task updated = taskRepository.save(task);

        auditService.log(currentUser.getId(), "COMPLETE", "TASK", id,
                "Completed task: " + task.getTitle());

        // Notify creator if different from completer
        if (task.getCreatedBy() != null && !task.getCreatedBy().getId().equals(currentUser.getId())) {
            notificationService.sendNotification(task.getCreatedBy().getId(),
                    "Nhiệm vụ hoàn thành",
                    completedBy != null ? completedBy.getFullName() : "Someone" + " đã hoàn thành: " + task.getTitle(),
                    "/tasks");
        }

        return TaskResponse.fromEntity(updated);
    }

    /**
     * Delete a task
     */
    public void deleteTask(Long id, UserPrincipal currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // Validate access
        if (currentUser.getRole().equals("MANAGER") && !task.getStore().getId().equals(currentUser.getStoreId())) {
            throw new ForbiddenException("You can only delete tasks for your store");
        }
        
        // Only the creator can delete the task
        if (task.getCreatedBy() != null && !task.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Chỉ người tạo nhiệm vụ mới có quyền xóa nhiệm vụ này");
        }

        String taskTitle = task.getTitle();
        User assignedTo = task.getAssignedTo();

        taskRepository.delete(task);

        // Notify assignee about task deletion
        if (assignedTo != null) {
            notificationService.sendNotification(assignedTo.getId(),
                    "Nhiệm vụ của bạn đã bị xóa",
                    "Nhiệm vụ \"" + taskTitle + "\" đã bị xóa khỏi hệ thống",
                    "/tasks");
        }

        auditService.log(currentUser.getId(), "DELETE", "TASK", id,
                "Deleted task: " + taskTitle);
    }

    /**
     * Get task statistics for a store
     */
    public Map<String, Long> getTaskStats(Long storeId) {
        List<Object[]> stats = taskRepository.countByStatusForStore(storeId);
        Map<String, Long> result = new HashMap<>();
        
        for (Object[] row : stats) {
            TaskStatus status = (TaskStatus) row[0];
            Long count = (Long) row[1];
            result.put(status.name(), count);
        }
        
        return result;
    }
}




