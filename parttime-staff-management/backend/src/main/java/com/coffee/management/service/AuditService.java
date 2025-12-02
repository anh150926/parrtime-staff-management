package com.coffee.management.service;

import com.coffee.management.entity.AuditLog;
import com.coffee.management.entity.User;
import com.coffee.management.repository.AuditLogRepository;
import com.coffee.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for audit logging
 */
@Service
@Transactional
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Log an action
     */
    public void log(Long userId, String action, String entity, Long entityId, String details) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .details(details)
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * Get audit logs by date range
     */
    public List<AuditLog> getAuditLogs(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return auditLogRepository.findByDateRange(startDate, endDate);
        }
        return auditLogRepository.findAllOrderByTimestampDesc();
    }

    /**
     * Get audit logs by entity
     */
    public List<AuditLog> getAuditLogsByEntity(String entity, Long entityId) {
        return auditLogRepository.findByEntityAndEntityId(entity, entityId);
    }
}








