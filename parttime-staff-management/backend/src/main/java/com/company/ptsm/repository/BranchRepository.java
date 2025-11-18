/*
 * file: backend/src/main/java/com/company/ptsm/repository/BranchRepository.java
 *
 * [CẢI TIẾN]
 * Repository cho Cơ sở (Branch).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Integer> {
    // JpaRepository đã cung cấp đủ các hàm CRUD cơ bản (findById, findAll, save...)
}