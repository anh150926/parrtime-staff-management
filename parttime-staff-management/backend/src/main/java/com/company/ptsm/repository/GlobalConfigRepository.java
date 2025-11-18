/*
 * file: backend/src/main/java/com/company/ptsm/repository/GlobalConfigRepository.java
 *
 * (Giữ nguyên)
 * Dùng để lấy HOURLY_WAGE.
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.GlobalConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GlobalConfigRepository extends JpaRepository<GlobalConfig, Integer> {

    /**
     * Lấy cấu hình theo Key (ví dụ: "HOURLY_WAGE")
     */
    Optional<GlobalConfig> findByConfigKey(String configKey);
}