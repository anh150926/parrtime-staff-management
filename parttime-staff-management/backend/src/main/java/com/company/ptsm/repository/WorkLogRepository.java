// file: backend/src/main/java/com/company/ptsm/repository/WorkLogRepository.java
package com.company.ptsm.repository;

import com.company.ptsm.model.WorkLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkLogRepository extends JpaRepository<WorkLog, Integer> {
    List<WorkLog> findByEmployeeIdAndShiftDateBetweenOrderByShiftDateAsc(Integer employeeId, LocalDate startDate,
            LocalDate endDate);

    List<WorkLog> findByShiftDateBetween(LocalDate startDate, LocalDate endDate);
}