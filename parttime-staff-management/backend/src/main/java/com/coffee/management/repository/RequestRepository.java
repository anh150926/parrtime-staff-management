package com.coffee.management.repository;

import com.coffee.management.entity.Request;
import com.coffee.management.entity.RequestStatus;
import com.coffee.management.entity.RequestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    
    List<Request> findByUserId(Long userId);
    
    List<Request> findByUserIdAndStatus(Long userId, RequestStatus status);
    
    List<Request> findByStatus(RequestStatus status);
    
    List<Request> findByType(RequestType type);
    
    @Query("SELECT r FROM Request r JOIN r.user u WHERE u.store.id = :storeId ORDER BY r.createdAt DESC")
    List<Request> findByStoreId(@Param("storeId") Long storeId);
    
    @Query("SELECT r FROM Request r JOIN r.user u WHERE u.store.id = :storeId AND r.status = :status ORDER BY r.createdAt DESC")
    List<Request> findByStoreIdAndStatus(@Param("storeId") Long storeId, @Param("status") RequestStatus status);
    
    @Query("SELECT COUNT(r) FROM Request r WHERE r.status = 'PENDING'")
    long countPendingRequests();
    
    @Query("SELECT COUNT(r) FROM Request r JOIN r.user u WHERE u.store.id = :storeId AND r.status = 'PENDING'")
    long countPendingRequestsByStore(@Param("storeId") Long storeId);
}








