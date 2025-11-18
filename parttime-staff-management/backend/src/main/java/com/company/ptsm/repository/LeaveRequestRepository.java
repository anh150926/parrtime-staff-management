/*
 * file: backend/src/main/java/com/company/ptsm/repository/LeaveRequestRepository.java
 *
 * [MỚI]
 * Repository cho Đơn xin nghỉ.
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Integer> {

    /**
     * Tìm các đơn xin nghỉ của 1 nhân viên (cho Staff xem).
     */
    List<LeaveRequest> findByUserId(Integer userId);

    /**
     * Tìm các đơn xin nghỉ ĐANG CHỜ DUYỆT (PENDING) tại 1 cơ sở (cho Manager).
     */
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.user.branch.id = :branchId AND lr.status = 'PENDING'")
    List<LeaveRequest> findPendingRequestsByBranch(Integer branchId);
}