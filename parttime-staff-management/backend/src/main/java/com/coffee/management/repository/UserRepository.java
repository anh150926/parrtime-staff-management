package com.coffee.management.repository;

import com.coffee.management.entity.Role;
import com.coffee.management.entity.User;
import com.coffee.management.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByStoreId(Long storeId);

    List<User> findByStoreIdAndRole(Long storeId, Role role);

    List<User> findByStatus(UserStatus status);

    @Query("SELECT u FROM User u WHERE u.store.id = :storeId AND u.status = 'ACTIVE'")
    List<User> findActiveStaffByStore(@Param("storeId") Long storeId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.store.id = :storeId AND u.role = 'STAFF'")
    long countStaffByStore(@Param("storeId") Long storeId);

    // For broadcast notifications
    @Query("SELECT u FROM User u WHERE u.store.id = :storeId AND u.status = :status")
    List<User> findByStoreIdAndStatus(@Param("storeId") Long storeId, @Param("status") UserStatus status);

    @Query("SELECT u FROM User u WHERE u.status = :status AND u.role != :role")
    List<User> findByStatusAndRoleNot(@Param("status") UserStatus status, @Param("role") Role role);

    // For employee ranking
    @Query("SELECT u FROM User u WHERE u.role = 'STAFF' AND u.status = 'ACTIVE' ORDER BY u.fullName")
    List<User> findAllActiveStaff();

    @Query("SELECT u FROM User u WHERE u.store.id = :storeId AND u.role = 'STAFF' AND u.status = 'ACTIVE'")
    List<User> findActiveStaffByStoreId(@Param("storeId") Long storeId);
}
