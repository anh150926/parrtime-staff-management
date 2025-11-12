// file: backend/src/main/java/com/company/ptsm/controller/EmployeeController.java
package com.company.ptsm.controller;

import com.company.ptsm.dto.employee.EmployeeSearchResponse;
import com.company.ptsm.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE', 'ROLE_MANAGER')")
    public ResponseEntity<List<EmployeeSearchResponse>> searchEmployees(
            @RequestParam(required = false) String name) {
        List<EmployeeSearchResponse> results = employeeService.searchEmployeesByName(name);
        return ResponseEntity.ok(results);
    }
}