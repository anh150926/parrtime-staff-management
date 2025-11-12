// file: backend/src/main/java/com/company/ptsm/controller/PayrollController.java
package com.company.ptsm.controller;

import com.company.ptsm.dto.payroll.PayrollDetailResponse;
import com.company.ptsm.dto.payroll.PayrollRangeRequest;
import com.company.ptsm.dto.payroll.PayrollSummaryResponse;
import com.company.ptsm.service.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_MANAGER')")
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/calculate")
    public ResponseEntity<List<PayrollSummaryResponse>> calculatePayroll(
            @Valid @RequestBody PayrollRangeRequest request) {
        List<PayrollSummaryResponse> response = payrollService.calculateAndSaveWeeklyPayroll(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<List<PayrollSummaryResponse>> getPayrollSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<PayrollSummaryResponse> response = payrollService.getPayrollSummary(startDate, endDate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/detail/{employeeId}")
    public ResponseEntity<List<PayrollDetailResponse>> getPayrollDetail(
            @PathVariable Integer employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<PayrollDetailResponse> response = payrollService.getPayrollDetail(employeeId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
}