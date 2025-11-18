/*
 * file: backend/src/main/java/com/company/ptsm/service/OperationsService.java
 *
 * [CẢI TIẾN - CẬP NHẬT]
 * (Đã thêm 2 hàm updateArticle và deleteArticle bị thiếu).
 */
package com.company.ptsm.service;

import com.company.ptsm.dto.operations.KnowledgeArticleDto;
import com.company.ptsm.dto.operations.TaskChecklistDto;
import com.company.ptsm.dto.operations.TaskLogDto;
import com.company.ptsm.exception.BusinessRuleException;
import com.company.ptsm.exception.NotFoundException;
import com.company.ptsm.model.*;
import com.company.ptsm.repository.KnowledgeArticleRepository;
import com.company.ptsm.repository.ShiftTemplateRepository;
import com.company.ptsm.repository.TaskChecklistRepository;
import com.company.ptsm.repository.TaskLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperationsService {

        private final KnowledgeArticleRepository knowledgeArticleRepository;
        private final TaskChecklistRepository taskChecklistRepository;
        private final TaskLogRepository taskLogRepository;
        private final ShiftTemplateRepository shiftTemplateRepository;
        private final AuditLogService auditLogService;

        // --- Logic cho Sổ tay Vận hành (Knowledge Base) ---

        @Transactional
        public KnowledgeArticleDto createArticle(KnowledgeArticleDto dto, User manager) {
                KnowledgeArticle article = KnowledgeArticle.builder()
                                .title(dto.getTitle())
                                .content(dto.getContent())
                                .category(dto.getCategory())
                                .createdBy(manager)
                                .build();

                KnowledgeArticle savedArticle = knowledgeArticleRepository.save(article);

                auditLogService.logAction(manager, "CREATE_KNOWLEDGE_ARTICLE", "Article_" + savedArticle.getId(),
                                "Tạo bài viết: " + savedArticle.getTitle());

                return mapToKnowledgeArticleDto(savedArticle);
        }

        @Transactional(readOnly = true)
        public List<KnowledgeArticleDto> getAllArticles() {
                return knowledgeArticleRepository.findAll().stream()
                                .map(this::mapToKnowledgeArticleDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public KnowledgeArticleDto getArticleById(Integer articleId) {
                KnowledgeArticle article = knowledgeArticleRepository.findById(articleId)
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy bài viết."));
                return mapToKnowledgeArticleDto(article);
        }

        /**
         * [MỚI] VAI TRÒ 2 (Manager): Cập nhật bài viết.
         */
        @Transactional
        public KnowledgeArticleDto updateArticle(Integer articleId, KnowledgeArticleDto dto, User manager) {
                KnowledgeArticle article = knowledgeArticleRepository.findById(articleId)
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy bài viết."));

                // (Bảo mật - Tùy chọn) Chỉ Manager tạo hoặc Super Admin mới được sửa
                // if (!article.getCreatedBy().getId().equals(manager.getId())) { ... }

                article.setTitle(dto.getTitle());
                article.setContent(dto.getContent());
                article.setCategory(dto.getCategory());

                KnowledgeArticle savedArticle = knowledgeArticleRepository.save(article);

                // Ghi log
                auditLogService.logAction(manager, "UPDATE_KNOWLEDGE_ARTICLE", "Article_" + savedArticle.getId(),
                                "Cập nhật bài viết: " + savedArticle.getTitle());

                return mapToKnowledgeArticleDto(savedArticle);
        }

        /**
         * [MỚI] VAI TRÒ 2 (Manager): Xóa bài viết.
         */
        @Transactional
        public void deleteArticle(Integer articleId) {
                if (!knowledgeArticleRepository.existsById(articleId)) {
                        throw new NotFoundException("Không tìm thấy bài viết.");
                }
                knowledgeArticleRepository.deleteById(articleId);

                // (Chúng ta có thể ghi log ở đây, nhưng cần truyền User manager vào)
                // auditLogService.logAction(manager, "DELETE_KNOWLEDGE_ARTICLE", "Article_" +
                // articleId, "Xóa bài viết");
        }

        // --- Logic cho Checklist Công việc ---

        @Transactional
        public TaskChecklistDto createChecklistTask(TaskChecklistDto dto, User manager) {
                Branch branch = manager.getBranch();

                ShiftTemplate template = shiftTemplateRepository.findById(dto.getShiftTemplateId())
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy Mẫu ca."));

                if (!template.getBranch().getId().equals(branch.getId())) {
                        throw new BusinessRuleException("Không thể tạo checklist cho Mẫu ca của cơ sở khác.");
                }

                TaskChecklist task = TaskChecklist.builder()
                                .branch(branch)
                                .shiftTemplate(template)
                                .taskDescription(dto.getTaskDescription())
                                .isActive(true)
                                .build();

                TaskChecklist savedTask = taskChecklistRepository.save(task);
                return mapToTaskChecklistDto(savedTask);
        }

        @Transactional(readOnly = true)
        public List<TaskChecklistDto> getChecklistForShiftTemplate(Integer shiftTemplateId, User user) {
                Integer branchId = user.getBranch().getId();
                ShiftTemplate template = shiftTemplateRepository.findById(shiftTemplateId)
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy Mẫu ca."));

                if (!template.getBranch().getId().equals(branchId)) {
                        throw new BusinessRuleException("Không thể xem checklist của cơ sở khác.");
                }

                List<TaskChecklist> tasks = taskChecklistRepository
                                .findByBranchIdAndShiftTemplateIdAndIsActiveTrue(branchId, shiftTemplateId);

                return tasks.stream()
                                .map(this::mapToTaskChecklistDto)
                                .collect(Collectors.toList());
        }

        @Transactional
        public TaskLogDto logTaskCompletion(Integer taskId, User staff) {
                TaskChecklist task = taskChecklistRepository.findById(taskId)
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy tác vụ."));

                TaskLog log = TaskLog.builder()
                                .task(task)
                                .user(staff)
                                .build();

                TaskLog savedLog = taskLogRepository.save(log);
                return mapToTaskLogDto(savedLog);
        }

        // --- Hàm tiện ích (Helpers) ---

        private KnowledgeArticleDto mapToKnowledgeArticleDto(KnowledgeArticle entity) {
                String authorName = "N/A";
                if (entity.getCreatedBy() != null) {
                        authorName = entity.getCreatedBy().getStaffProfile() != null
                                        ? entity.getCreatedBy().getStaffProfile().getFullName()
                                        : entity.getCreatedBy().getEmail();
                }

                return KnowledgeArticleDto.builder()
                                .id(entity.getId())
                                .title(entity.getTitle())
                                .content(entity.getContent())
                                .category(entity.getCategory())
                                .authorName(authorName)
                                .createdAt(entity.getCreatedAt())
                                .build();
        }

        private TaskChecklistDto mapToTaskChecklistDto(TaskChecklist entity) {
                return TaskChecklistDto.builder()
                                .id(entity.getId())
                                .shiftTemplateId(entity.getShiftTemplate().getId())
                                .shiftTemplateName(entity.getShiftTemplate().getName())
                                .taskDescription(entity.getTaskDescription())
                                .isActive(entity.isActive())
                                .build();
        }

        private TaskLogDto mapToTaskLogDto(TaskLog entity) {
                return TaskLogDto.builder()
                                .id(entity.getId())
                                .taskId(entity.getTask().getId())
                                .userId(entity.getUser().getId())
                                .staffName(entity.getUser().getStaffProfile() != null
                                                ? entity.getUser().getStaffProfile().getFullName()
                                                : "N/A")
                                .completedAt(entity.getCompletedAt())
                                .build();
        }
}