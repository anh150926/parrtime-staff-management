/*
 * file: backend/src/main/java/com/company/ptsm/repository/ShiftTemplateRepository.java
 *
 * [MỚI]
 * Repository cho Mẫu ca (ShiftTemplate).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.ShiftTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShiftTemplateRepository extends JpaRepository<ShiftTemplate, Integer> {

    /**
     * Lấy tất cả các mẫu ca của 1 cơ sở (cho Manager).
     */
    List<ShiftTemplate> findByBranchId(Integer branchId);
}