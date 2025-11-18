/*
 * file: backend/src/main/java/com/company/ptsm/repository/ScheduleAssignmentRepository.java
 *
 * [CẢI TIẾN]
 * Repository cho Phân công (ScheduleAssignment).
 * Quản lý việc gán Staff vào Schedule.
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.ScheduleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleAssignmentRepository extends JpaRepository<ScheduleAssignment, Integer> {

        /**
         * Tìm các ca đã gán cho 1 nhân viên trong 1 khoảng thời gian (cho Staff xem
         * lịch).
         */
        @Query("SELECT sa FROM ScheduleAssignment sa JOIN sa.schedule s " +
                        "WHERE sa.user.id = :userId AND s.scheduleDate BETWEEN :start AND :end " +
                        "ORDER BY s.scheduleDate, s.shiftTemplate.startTime")
        List<ScheduleAssignment> findByUserIdAndDateRange(Integer userId, LocalDate start, LocalDate end);

        /**
         * Lấy các lượt đăng ký ca ĐANG CHỜ DUYỆT (PENDING) tại 1 cơ sở.
         * (Cho VAI TRÒ 2 - Manager Dashboard).
         */
        @Query("SELECT sa FROM ScheduleAssignment sa " +
                        "WHERE sa.schedule.branch.id = :branchId AND sa.status = 'PENDING'")
        List<ScheduleAssignment> findPendingAssignmentsByBranch(Integer branchId);
}