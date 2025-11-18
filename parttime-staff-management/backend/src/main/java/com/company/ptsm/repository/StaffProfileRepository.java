/*
 * file: backend/src/main/java/com/company/ptsm/repository/StaffProfileRepository.java
 *
 * [CẢI TIẾN]
 * Repository cho Hồ sơ nhân viên (StaffProfile).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.StaffProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffProfileRepository extends JpaRepository<StaffProfile, Integer> {
    // (Integer là kiểu dữ liệu của user_id)
    // JpaRepository đã cung cấp đủ các hàm CRUD cơ bản (findById, save...)
}