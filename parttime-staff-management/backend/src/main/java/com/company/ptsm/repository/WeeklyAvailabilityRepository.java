// file: backend/src/main/java/com/company/ptsm/repository/WeeklyAvailabilityRepository.java
package com.company.ptsm.repository;

import com.company.ptsm.model.WeeklyAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface WeeklyAvailabilityRepository extends JpaRepository<WeeklyAvailability, Integer> {
    Optional<WeeklyAvailability> findByEmployeeIdAndWeekStartDate(Integer employeeId, LocalDate weekStartDate);
}