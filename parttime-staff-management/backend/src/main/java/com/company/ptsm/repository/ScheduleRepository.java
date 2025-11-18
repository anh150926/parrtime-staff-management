/*
 * file: backend/src/main/java/com/company/ptsm/repository/ScheduleRepository.java
 *
 * [CẢI TIẾN]
 * Repository cho các Ca trống (Schedule) do Manager tạo.
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {

    /**
     * Tìm các ca trống trong 1 tuần tại 1 cơ sở (để hiển thị Lịch tổng).
     */
    List<Schedule> findByBranchIdAndScheduleDateBetweenOrderByScheduleDateAsc(
            Integer branchId, LocalDate start, LocalDate end);
}