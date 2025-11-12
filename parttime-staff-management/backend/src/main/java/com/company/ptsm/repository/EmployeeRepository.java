// file: backend/src/main/java/com/company/ptsm/repository/EmployeeRepository.java
package com.company.ptsm.repository;

import com.company.ptsm.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    Optional<Employee> findByEmail(String email);

    List<Employee> findByNameContainingIgnoreCase(String name);
}