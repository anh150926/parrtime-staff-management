/*
 * file: backend/src/main/java/com/company/ptsm/repository/ContractRepository.java
 *
 * [MỚI]
 * Repository cho Hợp đồng (VAI TRÒ 2, Mục 8).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {

    /**
     * Lấy danh sách hợp đồng/GKSK sắp hết hạn tại 1 cơ sở (cho Manager)
     */
    @Query("SELECT c FROM Contract c JOIN c.user u WHERE u.branch.id = :branchId AND (c.endDate BETWEEN :today AND :thirtyDaysFromNow OR c.healthDocExpiry BETWEEN :today AND :thirtyDaysFromNow)")
    List<Contract> findExpiringContractsInBranch(Integer branchId, LocalDate today, LocalDate thirtyDaysFromNow);
}