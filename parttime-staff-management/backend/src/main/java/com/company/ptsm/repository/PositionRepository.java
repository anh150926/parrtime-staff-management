/*
 * file: backend/src/main/java/com/company/ptsm/repository/PositionRepository.java
 *
 * [CẢI TIẾN]
 * Repository cho Chức vụ (Position).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PositionRepository extends JpaRepository<Position, Integer> {

    /**
     * Lấy tất cả chức vụ tại 1 cơ sở (dùng khi Manager tạo NV mới)
     */
    List<Position> findByBranchId(Integer branchId);
}