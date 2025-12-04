package com.coffee.management.repository;

import com.coffee.management.entity.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    
    List<TimeLog> findByUserId(Long userId);
    
    @Query("SELECT t FROM TimeLog t WHERE t.user.id = :userId AND t.checkOut IS NULL ORDER BY t.checkIn DESC")
    Optional<TimeLog> findActiveCheckIn(@Param("userId") Long userId);
    
    @Query("SELECT t FROM TimeLog t WHERE t.user.id = :userId AND t.checkIn >= :startDate AND t.checkIn <= :endDate ORDER BY t.checkIn DESC")
    List<TimeLog> findByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT t FROM TimeLog t JOIN t.user u WHERE u.store.id = :storeId AND t.checkIn >= :startDate AND t.checkIn <= :endDate ORDER BY t.checkIn DESC")
    List<TimeLog> findByStoreAndDateRange(
            @Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(t.durationMinutes) FROM TimeLog t WHERE t.user.id = :userId AND t.checkIn >= :startDate AND t.checkIn <= :endDate")
    Long sumDurationByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(t.durationMinutes) FROM TimeLog t JOIN t.user u WHERE u.store.id = :storeId AND t.checkIn >= :startDate AND t.checkIn <= :endDate")
    Long sumDurationByStoreAndDateRange(
            @Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // For employee ranking
    @Query("SELECT t FROM TimeLog t " +
           "LEFT JOIN FETCH t.shift " +
           "WHERE t.user.id = :userId " +
           "AND t.checkIn >= :startDate " +
           "AND t.checkIn <= :endDate")
    List<TimeLog> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // For payroll - find time logs with associated shifts (to check late check-ins)
    @Query("SELECT t FROM TimeLog t " +
           "JOIN FETCH t.shift s " +
           "WHERE t.user.id = :userId " +
           "AND t.checkIn >= :startDate " +
           "AND t.checkIn <= :endDate " +
           "AND t.shift IS NOT NULL")
    List<TimeLog> findByUserIdAndDateRangeWithShift(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}






