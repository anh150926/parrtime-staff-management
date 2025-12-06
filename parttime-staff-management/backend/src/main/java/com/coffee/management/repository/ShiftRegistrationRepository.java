package com.coffee.management.repository;

import com.coffee.management.entity.ShiftRegistration;
import com.coffee.management.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftRegistrationRepository extends JpaRepository<ShiftRegistration, Long> {
    
    Optional<ShiftRegistration> findByShiftIdAndUserIdAndRegistrationDate(Long shiftId, Long userId, LocalDate registrationDate);
    
    List<ShiftRegistration> findByUserIdAndRegistrationDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    
    List<ShiftRegistration> findByShiftIdAndRegistrationDate(Long shiftId, LocalDate registrationDate);
    
    List<ShiftRegistration> findByShiftIdAndStatus(Long shiftId, RegistrationStatus status);
    
    @Query("SELECT DISTINCT sr FROM ShiftRegistration sr " +
           "LEFT JOIN FETCH sr.shift s " +
           "LEFT JOIN FETCH s.store " +
           "LEFT JOIN FETCH sr.user " +
           "WHERE sr.shift.id = :shiftId AND sr.registrationDate = :date AND sr.status = 'REGISTERED'")
    List<ShiftRegistration> findActiveRegistrationsByShiftAndDate(@Param("shiftId") Long shiftId, @Param("date") LocalDate date);
    
    @Query("SELECT DISTINCT sr FROM ShiftRegistration sr " +
           "LEFT JOIN FETCH sr.shift s " +
           "LEFT JOIN FETCH s.store " +
           "LEFT JOIN FETCH sr.user " +
           "WHERE sr.user.id = :userId AND sr.registrationDate BETWEEN :startDate AND :endDate AND sr.status = 'REGISTERED'")
    List<ShiftRegistration> findActiveRegistrationsByUserAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT DISTINCT sr FROM ShiftRegistration sr " +
           "LEFT JOIN FETCH sr.shift s " +
           "LEFT JOIN FETCH s.store st " +
           "LEFT JOIN FETCH sr.user " +
           "WHERE st.id = :storeId AND sr.registrationDate BETWEEN :startDate AND :endDate AND sr.status = 'REGISTERED'")
    List<ShiftRegistration> findActiveRegistrationsByStoreAndDateRange(@Param("storeId") Long storeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
