/*
 * file: backend/src/main/java/com/company/ptsm/repository/TaskLogRepository.java
 *
 * [MỚI]
 * Repository cho Log hoàn thành Checklist (TaskLog).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.TaskLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskLogRepository extends JpaRepository<TaskLog, Integer> {
    // (Có thể thêm các hàm tìm kiếm log theo ngày/nhân viên nếu cần)
}