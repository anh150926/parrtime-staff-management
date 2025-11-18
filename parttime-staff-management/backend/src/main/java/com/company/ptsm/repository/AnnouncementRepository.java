/*
 * file: backend/src/main/java/com/company/ptsm/repository/AnnouncementRepository.java
 *
 * [MỚI]
 * Repository cho Thông báo (Announcement).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Integer> {

    /**
     * Lấy thông báo cho 1 cơ sở (branchId)
     * HOẶC thông báo chung (branchId IS NULL).
     * Sắp xếp mới nhất lên đầu.
     */
    @Query("SELECT a FROM Announcement a WHERE a.branch.id = :branchId OR a.branch.id IS NULL ORDER BY a.createdAt DESC")
    List<Announcement> findAnnouncementsForBranch(Integer branchId);

    /**
     * Lấy tất cả thông báo (dành cho Super Admin).
     */
    List<Announcement> findAllByOrderByCreatedAtDesc();
}