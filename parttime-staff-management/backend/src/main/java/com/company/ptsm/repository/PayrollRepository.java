// file: backend/src/main/java/com/company/ptsm/repository/PayrollRepository.java
package com.company.ptsm.repository;

import com.company.ptsm.model.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Integer> {
    List<Payroll> findByWeekStartDateAndWeekEndDate(LocalDate startDate, LocalDate endDate);

    List<Payroll> findByEmployeeIdAndWeekStartDateBetween(Integer employeeId, LocalDate startDate, LocalDate endDate);
}