package com.coffee.management.repository;

import com.coffee.management.entity.ShiftMarketplace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftMarketplaceRepository extends JpaRepository<ShiftMarketplace, Long> {

    /**
     * Find available listings by store (pending or claimed status)
     */
    @Query("SELECT m FROM ShiftMarketplace m " +
           "JOIN m.shift s " +
           "WHERE s.store.id = :storeId " +
           "AND m.status IN ('PENDING', 'CLAIMED') " +
           "AND s.startDatetime > :now " +
           "ORDER BY s.startDatetime ASC")
    List<ShiftMarketplace> findAvailableByStore(@Param("storeId") Long storeId, @Param("now") LocalDateTime now);

    /**
     * Find all listings by store for manager
     */
    @Query("SELECT m FROM ShiftMarketplace m " +
           "JOIN m.shift s " +
           "WHERE s.store.id = :storeId " +
           "ORDER BY m.createdAt DESC")
    List<ShiftMarketplace> findAllByStore(@Param("storeId") Long storeId);

    /**
     * Find listings by user (as from_user)
     */
    List<ShiftMarketplace> findByFromUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find listings by shift
     */
    List<ShiftMarketplace> findByShiftId(Long shiftId);

    /**
     * Find active listing for a shift (not yet approved/rejected/cancelled)
     */
    @Query("SELECT m FROM ShiftMarketplace m WHERE m.shift.id = :shiftId AND m.status IN ('PENDING', 'CLAIMED')")
    Optional<ShiftMarketplace> findActiveByShiftId(@Param("shiftId") Long shiftId);

    /**
     * Find claimed listings pending manager approval
     */
    @Query("SELECT m FROM ShiftMarketplace m " +
           "JOIN m.shift s " +
           "WHERE s.store.id = :storeId " +
           "AND m.status = 'CLAIMED' " +
           "ORDER BY m.createdAt ASC")
    List<ShiftMarketplace> findPendingApprovalByStore(@Param("storeId") Long storeId);

    /**
     * Count active listings by store
     */
    @Query("SELECT COUNT(m) FROM ShiftMarketplace m " +
           "JOIN m.shift s " +
           "WHERE s.store.id = :storeId " +
           "AND m.status = 'PENDING'")
    Long countPendingByStore(@Param("storeId") Long storeId);

    /**
     * Find expired listings that need to be updated
     */
    @Query("SELECT m FROM ShiftMarketplace m " +
           "WHERE m.status = 'PENDING' " +
           "AND (m.expiresAt < :now OR m.shift.startDatetime < :now)")
    List<ShiftMarketplace> findExpiredListings(@Param("now") LocalDateTime now);

    /**
     * Statistics - count by type and status for a store
     */
    @Query("SELECT m.type, m.status, COUNT(m) FROM ShiftMarketplace m " +
           "JOIN m.shift s " +
           "WHERE s.store.id = :storeId " +
           "GROUP BY m.type, m.status")
    List<Object[]> getStatsByStore(@Param("storeId") Long storeId);
}

