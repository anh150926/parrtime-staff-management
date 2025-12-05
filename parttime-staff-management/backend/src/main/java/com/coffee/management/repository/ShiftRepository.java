package com.coffee.management.repository;

import com.coffee.management.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    
    List<Shift> findByStoreId(Long storeId);
    
    @Query("SELECT s FROM Shift s WHERE s.store.id = :storeId AND s.startDatetime >= :startDate AND s.endDatetime <= :endDate ORDER BY s.startDatetime")
    List<Shift> findByStoreAndDateRange(
            @Param("storeId") Long storeId, 
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT s FROM Shift s WHERE s.startDatetime >= :startDate AND s.endDatetime <= :endDate ORDER BY s.startDatetime")
    List<Shift> findByDateRange(
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT s FROM Shift s JOIN s.assignments a WHERE a.user.id = :userId AND s.startDatetime >= :startDate ORDER BY s.startDatetime")
    List<Shift> findByUserAssignment(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(s) FROM Shift s WHERE s.store.id = :storeId AND MONTH(s.startDatetime) = :month AND YEAR(s.startDatetime) = :year")
    long countByStoreAndMonth(@Param("storeId") Long storeId, @Param("month") int month, @Param("year") int year);
    
    @Query("SELECT DISTINCT s FROM Shift s " +
           "LEFT JOIN FETCH s.store " +
           "LEFT JOIN FETCH s.createdBy " +
           "LEFT JOIN FETCH s.assignments a " +
           "LEFT JOIN FETCH a.user " +
           "WHERE s.id = :id")
    Optional<Shift> findByIdWithRelations(@Param("id") Long id);
}








