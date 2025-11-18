/*
 * file: backend/src/main/java/com/company/ptsm/repository/PollVoteRepository.java
 *
 * [MỚI]
 * Repository cho Phiếu bầu (PollVote).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, Integer> {
    // (Không cần hàm tùy chỉnh nếu chỉ dùng các hàm save/check exists
    // trong logic của PollService)
}