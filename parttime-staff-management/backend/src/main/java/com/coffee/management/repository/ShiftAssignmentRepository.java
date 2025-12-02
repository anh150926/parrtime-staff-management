package com.coffee.management.repository;

import com.coffee.management.entity.AssignmentStatus;
import com.coffee.management.entity.ShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Long> {
    
    List<ShiftAssignment> findByShiftId(Long shiftId);
    
    List<ShiftAssignment> findByUserId(Long userId);
    
    Optional<ShiftAssignment> findByShiftIdAndUserId(Long shiftId, Long userId);
    
    boolean existsByShiftIdAndUserId(Long shiftId, Long userId);
    
    List<ShiftAssignment> findByUserIdAndStatus(Long userId, AssignmentStatus status);
    
    @Query("SELECT sa FROM ShiftAssignment sa JOIN FETCH sa.shift s WHERE sa.user.id = :userId AND sa.status = :status ORDER BY s.startDatetime")
    List<ShiftAssignment> findByUserWithShift(@Param("userId") Long userId, @Param("status") AssignmentStatus status);
    
    @Query("SELECT COUNT(sa) FROM ShiftAssignment sa WHERE sa.shift.id = :shiftId AND sa.status = 'CONFIRMED'")
    long countConfirmedByShift(@Param("shiftId") Long shiftId);

    void deleteByShiftIdAndUserId(Long shiftId, Long userId);

    // For employee ranking
    @Query("SELECT sa FROM ShiftAssignment sa " +
           "JOIN FETCH sa.shift s " +
           "WHERE sa.user.id = :userId " +
           "AND s.startDatetime >= :startDate " +
           "AND s.startDatetime <= :endDate")
    List<ShiftAssignment> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);
}





