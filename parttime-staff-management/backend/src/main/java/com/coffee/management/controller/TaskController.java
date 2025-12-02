package com.coffee.management.controller;

import com.coffee.management.dto.ApiResponse;
import com.coffee.management.dto.task.*;
import com.coffee.management.security.UserPrincipal;
import com.coffee.management.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for task management endpoints
 */
@RestController
@RequestMapping("/api/v1/tasks")
@Tag(name = "Tasks", description = "Task management endpoints")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Get tasks by store")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByStore(
            @PathVariable Long storeId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<TaskResponse> tasks = taskService.getTasksByStore(storeId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/shift/{shiftId}")
    @Operation(summary = "Get tasks by shift")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByShift(
            @PathVariable Long shiftId) {
        List<TaskResponse> tasks = taskService.getTasksByShift(shiftId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/my-tasks")
    @Operation(summary = "Get tasks assigned to me")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getMyTasks(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<TaskResponse> tasks = taskService.getMyTasks(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/today/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Get today's tasks for a store")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTodaysTasks(
            @PathVariable Long storeId) {
        List<TaskResponse> tasks = taskService.getTodaysTasks(storeId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/overdue/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Get overdue tasks for a store")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getOverdueTasks(
            @PathVariable Long storeId) {
        List<TaskResponse> tasks = taskService.getOverdueTasks(storeId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TaskResponse task = taskService.getTaskById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Create a new task")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TaskResponse task = taskService.createTask(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Tạo nhiệm vụ thành công", task));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Update a task")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TaskResponse task = taskService.updateTask(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật nhiệm vụ thành công", task));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Mark task as completed")
    public ResponseEntity<ApiResponse<TaskResponse>> completeTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TaskResponse task = taskService.completeTask(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Hoàn thành nhiệm vụ", task));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Delete a task")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        taskService.deleteTask(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Xóa nhiệm vụ thành công", null));
    }

    @GetMapping("/stats/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Get task statistics for a store")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getTaskStats(
            @PathVariable Long storeId) {
        Map<String, Long> stats = taskService.getTaskStats(storeId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}




