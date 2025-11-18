/*
 * file: backend/src/main/java/com/company/ptsm/repository/PayrollAdjustmentRepository.java
 *
 * [MỚI]
 * Repository cho Thưởng/Phạt (PayrollAdjustment).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.PayrollAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollAdjustmentRepository extends JpaRepository<PayrollAdjustment, Integer> {

    /**
     * Lấy tất cả thưởng/phạt của 1 nhân viên trong 1 tháng (dùng cho Tính lương).
     */
    @Query("SELECT pa FROM PayrollAdjustment pa WHERE pa.user.id = :userId AND EXTRACT(MONTH FROM pa.createdAt) = :month AND EXTRACT(YEAR FROM pa.createdAt) = :year")
    List<PayrollAdjustment> findByUserIdAndMonthAndYear(Integer userId, int month, int year);
}