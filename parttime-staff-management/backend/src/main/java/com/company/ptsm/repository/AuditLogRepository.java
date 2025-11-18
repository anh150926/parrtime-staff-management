/*
 * file: backend/src/main/java/com/company/ptsm/repository/AuditLogRepository.java
 *
 * [MỚI]
 * Repository cho Lịch sử Hoạt động (AuditLog).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {

    /**
     * Lấy lịch sử hoạt động của 1 Manager (VAI TRÒ 2, Mục 9).
     */
    List<AuditLog> findByUserIdOrderByTimestampDesc(Integer userId);
}