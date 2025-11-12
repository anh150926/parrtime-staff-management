// file: backend/src/main/java/com/company/ptsm/service/EmployeeService.java
package com.company.ptsm.service;

import com.company.ptsm.dto.employee.EmployeeSearchResponse;
import com.company.ptsm.model.Employee;
import com.company.ptsm.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<EmployeeSearchResponse> searchEmployeesByName(String name) {
        List<Employee> employees;
        if (name == null || name.trim().isEmpty()) {
            employees = employeeRepository.findAll();
        } else {
            employees = employeeRepository.findByNameContainingIgnoreCase(name);
        }

        return employees.stream().map(employee -> EmployeeSearchResponse.builder()
                .id(employee.getId())
                .name(employee.getName())
                .phoneNumber(employee.getPhoneNumber())
                .restaurantName(employee.getRestaurant() != null ? employee.getRestaurant().getName() : "Chưa gán")
                .build()).collect(Collectors.toList());
    }
}