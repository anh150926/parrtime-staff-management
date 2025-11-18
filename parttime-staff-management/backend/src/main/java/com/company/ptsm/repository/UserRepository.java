/*
 * file: backend/src/main/java/com/company/ptsm/repository/UserRepository.java
 *
 * [CẢI TIẾN]
 * Thay thế EmployeeRepository.
 * Dùng để tìm kiếm User (SUPER_ADMIN, MANAGER, STAFF).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.User;
import com.company.ptsm.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    /**
     * Hàm cốt lõi cho Spring Security và AuthService (Login/Register).
     */
    Optional<User> findByEmail(String email);

    /**
     * Lấy tất cả nhân viên (STAFF) tại một cơ sở (cho Manager).
     */
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.branch.id = :branchId")
    List<User> findByBranchIdAndRole(Integer branchId, Role role);

    /**
     * Lấy tất cả Quản lý (MANAGER) (cho Super Admin).
     */
    List<User> findByRole(Role role);

    /**
     * [MỚI] Đếm số lượng mã NV đã tồn tại (dùng để tạo Mã NV tự động)
     * (Hàm này hỗ trợ logic Đề 2: PDTT0001)
     */
    @Query("SELECT COUNT(p.id) FROM StaffProfile p WHERE p.employeeCode LIKE :prefix%")
    long countByEmployeeCodeStartingWith(String prefix);
}