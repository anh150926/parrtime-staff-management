// file: backend/src/main/java/com/company/ptsm/repository/AvailabilitySlotRepository.java
package com.company.ptsm.repository;

import com.company.ptsm.model.AvailabilitySlot;
import com.company.ptsm.model.enums.DayOfWeekEnum;
import com.company.ptsm.model.enums.ShiftType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Integer> {

    @Query("SELECT s FROM AvailabilitySlot s " +
            "JOIN s.availability w " +
            "JOIN w.employee e " +
            "WHERE e.restaurant.id = :restaurantId " +
            "AND w.weekStartDate = :weekStartDate " +
            "AND s.dayOfWeek = :dayOfWeek " +
            "AND s.shiftType = :shiftType")
    List<AvailabilitySlot> findRegisteredSlots(
            @Param("restaurantId") Integer restaurantId,
            @Param("weekStartDate") LocalDate weekStartDate,
            @Param("dayOfWeek") DayOfWeekEnum dayOfWeek,
            @Param("shiftType") ShiftType shiftType);
}