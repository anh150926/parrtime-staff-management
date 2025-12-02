package com.coffee.management.repository;

import com.coffee.management.entity.ShiftSwapRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShiftSwapRequestRepository extends JpaRepository<ShiftSwapRequest, Long> {

    /**
     * Find swap requests involving a user (as from or to)
     */
    @Query("SELECT s FROM ShiftSwapRequest s " +
           "WHERE s.fromUser.id = :userId OR s.toUser.id = :userId " +
           "ORDER BY s.createdAt DESC")
    List<ShiftSwapRequest> findByUserId(@Param("userId") Long userId);

    /**
     * Find swap requests pending peer confirmation for a user
     */
    @Query("SELECT s FROM ShiftSwapRequest s " +
           "WHERE s.toUser.id = :userId " +
           "AND s.status = 'PENDING_PEER' " +
           "ORDER BY s.createdAt ASC")
    List<ShiftSwapRequest> findPendingPeerConfirmation(@Param("userId") Long userId);

    /**
     * Find swap requests pending manager approval by store
     */
    @Query("SELECT s FROM ShiftSwapRequest s " +
           "JOIN s.fromAssignment fa " +
           "JOIN fa.shift fs " +
           "WHERE fs.store.id = :storeId " +
           "AND s.status = 'PENDING_MANAGER' " +
           "ORDER BY s.createdAt ASC")
    List<ShiftSwapRequest> findPendingManagerApprovalByStore(@Param("storeId") Long storeId);

    /**
     * Find all swap requests by store for manager
     */
    @Query("SELECT s FROM ShiftSwapRequest s " +
           "JOIN s.fromAssignment fa " +
           "JOIN fa.shift fs " +
           "WHERE fs.store.id = :storeId " +
           "ORDER BY s.createdAt DESC")
    List<ShiftSwapRequest> findAllByStore(@Param("storeId") Long storeId);

    /**
     * Check if there's an active swap request for an assignment
     */
    @Query("SELECT COUNT(s) > 0 FROM ShiftSwapRequest s " +
           "WHERE (s.fromAssignment.id = :assignmentId OR s.toAssignment.id = :assignmentId) " +
           "AND s.status IN ('PENDING_PEER', 'PENDING_MANAGER')")
    boolean hasActiveSwapRequest(@Param("assignmentId") Long assignmentId);
}

