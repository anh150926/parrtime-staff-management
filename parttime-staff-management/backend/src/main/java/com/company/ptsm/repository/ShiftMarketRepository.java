/*
 * file: backend/src/main/java/com/company/ptsm/repository/ShiftMarketRepository.java
 *
 * [MỚI]
 * Repository cho "Chợ Ca" (ShiftMarket).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.ShiftMarket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShiftMarketRepository extends JpaRepository<ShiftMarket, Integer> {

    /**
     * Lấy các ca đang "bán" (POSTED) tại 1 cơ sở (cho Staff xem).
     */
    @Query("SELECT sm FROM ShiftMarket sm JOIN sm.assignment.schedule s " +
            "WHERE s.branch.id = :branchId AND sm.status = 'POSTED'")
    List<ShiftMarket> findPostedShiftsByBranch(Integer branchId);

    /**
     * Lấy các ca đang "chờ duyệt" (CLAIMED) tại 1 cơ sở (cho Manager xem).
     */
    @Query("SELECT sm FROM ShiftMarket sm JOIN sm.assignment.schedule s " +
            "WHERE s.branch.id = :branchId AND sm.status = 'CLAIMED'")
    List<ShiftMarket> findClaimedShiftsByBranch(Integer branchId);
}