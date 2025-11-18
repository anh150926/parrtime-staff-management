/*
 * file: backend/src/main/java/com/company/ptsm/service/AuditLogService.java
 *
 * [MỚI]
 * Service này xử lý nghiệp vụ Ghi và Đọc Lịch sử Hoạt động.
 * (VAI TRÒ 2, Mục 9).
 */
package com.company.ptsm.service;

import com.company.ptsm.dto.audit.AuditLogDto;
import com.company.ptsm.model.AuditLog;
import com.company.ptsm.model.User;
import com.company.ptsm.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * [HÀM NỘI BỘ]
     * Được gọi bởi các Service khác (StaffService, TimesheetService...)
     * để ghi lại một hành động quan trọng.
     *
     * @param user     (Manager) Người thực hiện
     * @param action   (Hành động) VD: "EDIT_TIMESHEET"
     * @param targetId (ID đối tượng) VD: "WorkLog_10"
     * @param details  (Chi tiết) VD: "Sửa check-in từ 8:00 thành 8:15"
     */
    @Transactional
    public void logAction(User user, String action, String targetId, String details) {
        // (Chúng ta có thể kiểm tra Role ở đây, chỉ ghi log cho Manager/SuperAdmin)
        if (user == null || user.getRole() == com.company.ptsm.model.enums.Role.ROLE_STAFF) {
            return; // Không ghi log cho Staff
        }

        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .targetId(targetId)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    /**
     * VAI TRÒ 2 (Manager): Lấy Lịch sử Hoạt động của chính mình.
     */
    @Transactional(readOnly = true)
    public List<AuditLogDto> getMyAuditLogs(User manager) {
        List<AuditLog> logs = auditLogRepository.findByUserIdOrderByTimestampDesc(manager.getId());
        return logs.stream()
                .map(this::mapToAuditLogDto)
                .collect(Collectors.toList());
    }

    // --- Hàm tiện ích (Helper) ---

    private AuditLogDto mapToAuditLogDto(AuditLog entity) {
        String userName = "N/A";
        if (entity.getUser() != null) {
            userName = entity.getUser().getStaffProfile() != null ? entity.getUser().getStaffProfile().getFullName()
                    : entity.getUser().getEmail();
        }

        return AuditLogDto.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .userName(userName)
                .action(entity.getAction())
                .targetId(entity.getTargetId())
                .details(entity.getDetails())
                .timestamp(entity.getTimestamp())
                .build();
    }
}
