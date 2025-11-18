/*
 * file: backend/src/main/java/com/company/ptsm/repository/WorkLogRepository.java
 *
 * [CẢI TIẾN]
 * Repository cho Chấm công (WorkLog).
 * (Thay thế WorkLogRepository cũ).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.WorkLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkLogRepository extends JpaRepository<WorkLog, Integer> {

    /**
     * Tìm log chấm công của 1 nhân viên trong 1 khoảng thời gian (dùng cho Tính
     * lương).
     */
    List<WorkLog> findByUserIdAndCheckInBetween(Integer userId, OffsetDateTime start, OffsetDateTime end);

    /**
     * Tìm log chấm công của 1 cơ sở trong 1 khoảng thời gian (dùng cho Manager
     * xem).
     */
    List<WorkLog> findByBranchIdAndCheckInBetweenOrderByCheckInDesc(Integer branchId, OffsetDateTime start,
            OffsetDateTime end);

    /**
     * Tìm ca đang làm việc (chưa check-out) của 1 nhân viên.
     * (Dùng cho chức năng Check-out).
     */
    Optional<WorkLog> findByUserIdAndCheckOutIsNull(Integer userId);
}