/*
 * file: backend/src/main/java/com/company/ptsm/controller/OperationsController.java
 *
 * [MỚI]
 * Controller cho nghiệp vụ Vận hành (Sổ tay, Checklist).
 */
package com.company.ptsm.controller;

import com.company.ptsm.dto.operations.KnowledgeArticleDto;
import com.company.ptsm.dto.operations.TaskChecklistDto;
import com.company.ptsm.dto.operations.TaskLogDto;
import com.company.ptsm.model.User;
import com.company.ptsm.service.OperationsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class OperationsController {

    private final OperationsService operationsService;

    // --- API cho Sổ tay Vận hành (Knowledge Base) ---

    @PostMapping("/knowledge-base")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<KnowledgeArticleDto> createArticle(
            @Valid @RequestBody KnowledgeArticleDto dto,
            @AuthenticationPrincipal User manager) {
        KnowledgeArticleDto created = operationsService.createArticle(dto, manager);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/knowledge-base")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<KnowledgeArticleDto>> getAllArticles() {
        return ResponseEntity.ok(operationsService.getAllArticles());
    }

    @GetMapping("/knowledge-base/{id}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<KnowledgeArticleDto> getArticleById(@PathVariable Integer id) {
        return ResponseEntity.ok(operationsService.getArticleById(id));
    }

    @PutMapping("/knowledge-base/{id}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<KnowledgeArticleDto> updateArticle(
            @PathVariable Integer id,
            @Valid @RequestBody KnowledgeArticleDto dto,
            @AuthenticationPrincipal User manager) {
        KnowledgeArticleDto updated = operationsService.updateArticle(id, dto, manager);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/knowledge-base/{id}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> deleteArticle(@PathVariable Integer id) {
        operationsService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }

    // --- API cho Checklist Công việc ---

    @PostMapping("/checklists")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<TaskChecklistDto> createChecklistTask(
            @Valid @RequestBody TaskChecklistDto dto,
            @AuthenticationPrincipal User manager) {
        TaskChecklistDto createdTask = operationsService.createChecklistTask(dto, manager);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @GetMapping("/checklists/template/{shiftTemplateId}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_STAFF')")
    public ResponseEntity<List<TaskChecklistDto>> getChecklistForShift(
            @PathVariable Integer shiftTemplateId,
            @AuthenticationPrincipal User user) {
        List<TaskChecklistDto> tasks = operationsService.getChecklistForShiftTemplate(shiftTemplateId, user);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/checklists/log/{taskId}")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<TaskLogDto> logTaskCompletion(
            @PathVariable Integer taskId,
            @AuthenticationPrincipal User staff) {
        TaskLogDto log = operationsService.logTaskCompletion(taskId, staff);
        return new ResponseEntity<>(log, HttpStatus.CREATED);
    }
}