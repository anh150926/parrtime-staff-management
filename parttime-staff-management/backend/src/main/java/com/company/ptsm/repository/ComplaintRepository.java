/*
 * file: backend/src/main/java/com/company/ptsm/repository/ComplaintRepository.java
 *
 * [MỚI]
 * Repository cho Khiếu nại (Complaint).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {

    /**
     * Lấy khiếu nại của 1 cơ sở (cho Manager).
     */
    List<Complaint> findByBranchIdOrderByCreatedAtDesc(Integer branchId);

    /**
     * Lấy khiếu nại của 1 nhân viên (cho Staff).
     */
    List<Complaint> findByStaffUserIdOrderByCreatedAtDesc(Integer userId);
}