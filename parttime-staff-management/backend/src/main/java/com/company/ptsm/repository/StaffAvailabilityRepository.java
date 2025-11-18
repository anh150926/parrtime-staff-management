/*
 * file: backend/src/main/java/com/company/ptsm/repository/StaffAvailabilityRepository.java
 *
 * [MỚI]
 * Repository cho các lịch bận (VD: Lịch học) của nhân viên.
 * (Thay thế WeeklyAvailabilityRepository cũ).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.StaffAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StaffAvailabilityRepository extends JpaRepository<StaffAvailability, Integer> {

    /**
     * Lấy tất cả lịch bận của 1 nhân viên.
     */
    List<StaffAvailability> findByUserId(Integer userId);
}