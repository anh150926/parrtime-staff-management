/*
 * file: backend/src/main/java/com/company/ptsm/repository/TaskChecklistRepository.java
 *
 * [MỚI]
 * Repository cho Tác vụ Checklist (TaskChecklist).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.TaskChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskChecklistRepository extends JpaRepository<TaskChecklist, Integer> {

    /**
     * Lấy tất cả checklist của 1 cơ sở, cho 1 mẫu ca
     * (VAI TRÒ 3, Mục 7: Staff xem checklist ca của mình).
     */
    List<TaskChecklist> findByBranchIdAndShiftTemplateIdAndIsActiveTrue(
            Integer branchId, Integer shiftTemplateId);
}