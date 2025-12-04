package com.coffee.management.repository;

import com.coffee.management.entity.Complaint;
import com.coffee.management.entity.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    // Find complaints by store
    List<Complaint> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    // Find complaints by sender
    List<Complaint> findByFromUserIdOrderByCreatedAtDesc(Long userId);

    // Find complaints by status
    List<Complaint> findByStoreIdAndStatusOrderByCreatedAtDesc(Long storeId, ComplaintStatus status);

    // Find pending complaints for a store
    @Query("SELECT c FROM Complaint c WHERE c.store.id = :storeId AND c.status IN ('PENDING', 'IN_PROGRESS') ORDER BY c.createdAt DESC")
    List<Complaint> findPendingByStore(@Param("storeId") Long storeId);

    // Count pending complaints
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.store.id = :storeId AND c.status = 'PENDING'")
    long countPendingByStore(@Param("storeId") Long storeId);

    // Find all complaints (for Owner)
    @Query("SELECT c FROM Complaint c ORDER BY c.createdAt DESC")
    List<Complaint> findAllOrderByCreatedAtDesc();

    // Find pending complaints (for Owner)
    @Query("SELECT c FROM Complaint c WHERE c.status IN ('PENDING', 'IN_PROGRESS') ORDER BY c.createdAt DESC")
    List<Complaint> findAllPending();

    // Find resolved complaints against a user within a date range (for payroll deductions)
    @Query("SELECT c FROM Complaint c WHERE c.toUser.id = :userId " +
           "AND c.status = 'RESOLVED' " +
           "AND c.createdAt >= :startDate " +
           "AND c.createdAt <= :endDate")
    List<Complaint> findResolvedComplaintsAgainstUser(
            @Param("userId") Long userId,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);

    // Count resolved complaints against a user within a date range
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.toUser.id = :userId " +
           "AND c.status = 'RESOLVED' " +
           "AND c.createdAt >= :startDate " +
           "AND c.createdAt <= :endDate")
    long countResolvedComplaintsAgainstUser(
            @Param("userId") Long userId,
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);
}



