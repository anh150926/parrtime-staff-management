/*
 * file: backend/src/main/java/com/company/ptsm/repository/PollRepository.java
 *
 * [MỚI]
 * Repository cho Khảo sát (Poll).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PollRepository extends JpaRepository<Poll, Integer> {

    /**
     * Lấy các khảo sát đang hoạt động tại 1 cơ sở (cho Staff).
     */
    List<Poll> findByBranchIdAndIsActiveTrueOrderByCreatedAtDesc(Integer branchId);
}