/*
 * file: backend/src/main/java/com/company/ptsm/repository/PayrollRepository.java
 *
 * [CẢI TIẾN]
 * Repository cho Phiếu lương (theo tháng).
 * (Thay thế PayrollRepository cũ).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Integer> {

    /**
     * Tìm phiếu lương của 1 nhân viên trong 1 tháng cụ thể.
     */
    Optional<Payroll> findByUserIdAndMonthAndYear(Integer userId, int month, int year);

    /**
     * Lấy tất cả phiếu lương của 1 cơ sở trong 1 tháng (cho Manager).
     */
    @Query("SELECT p FROM Payroll p JOIN p.user u WHERE u.branch.id = :branchId AND p.month = :month AND p.year = :year")
    List<Payroll> findByBranchAndMonth(Integer branchId, int month, int year);
}