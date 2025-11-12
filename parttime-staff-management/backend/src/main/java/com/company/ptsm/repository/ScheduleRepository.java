// file: backend/src/main/java/com/company/ptsm/repository/ScheduleRepository.java
package com.company.ptsm.repository;

import com.company.ptsm.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {
    Optional<Schedule> findByRestaurantIdAndWeekStartDate(Integer restaurantId, LocalDate weekStartDate);
}