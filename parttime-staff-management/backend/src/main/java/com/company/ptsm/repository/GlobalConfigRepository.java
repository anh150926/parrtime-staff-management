// file: backend/src/main/java/com/company/ptsm/repository/GlobalConfigRepository.java
package com.company.ptsm.repository;

import com.company.ptsm.model.GlobalConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GlobalConfigRepository extends JpaRepository<GlobalConfig, Integer> {
    Optional<GlobalConfig> findByConfigKey(String configKey);
}