// file: backend/src/main/java/com/company/ptsm/repository/PayrollRuleRepository.java
package com.company.ptsm.repository;

import com.company.ptsm.model.PayrollRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PayrollRuleRepository extends JpaRepository<PayrollRule, Integer> {
    Optional<PayrollRule> findByRuleName(String ruleName);
}