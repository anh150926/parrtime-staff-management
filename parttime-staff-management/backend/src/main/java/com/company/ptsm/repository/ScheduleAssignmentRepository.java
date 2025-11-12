// file: backend/src/main/java/com/company/ptsm/repository/ScheduleAssignmentRepository.java
package com.company.ptsm.repository;

import com.company.ptsm.model.ScheduleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleAssignmentRepository extends JpaRepository<ScheduleAssignment, Integer> {

    @Query("SELECT COUNT(sa) FROM ScheduleAssignment sa WHERE sa.employee.id = :employeeId AND sa.assignmentDate BETWEEN :startDate AND :endDate")
    long countAssignmentsByEmployeeInWeek(
            @Param("employeeId") Integer employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    List<ScheduleAssignment> findByEmployeeIdAndAssignmentDateBetween(Integer employeeId, LocalDate startDate,
            LocalDate endDate);
}