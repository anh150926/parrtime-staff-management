/*
 * file: backend/src/main/java/com/company/ptsm/controller/PayrollController.java
 *
 * [CẢI TIẾN - ĐÃ SỬA LỖI IMPORT]
 */
package com.company.ptsm.controller;

// [SỬA LỖI] THÊM CÁC IMPORT DTO CÒN THIẾU
import com.company.ptsm.dto.payroll.PayrollAdjustmentDto;
import com.company.ptsm.dto.payroll.PayrollAdjustmentRequest;
import com.company.ptsm.dto.payroll.PayrollCalculationRequest;
import com.company.ptsm.dto.payroll.PayrollDto;
// [KẾT THÚC SỬA LỖI]

import com.company.ptsm.model.User;
import com.company.ptsm.service.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/calculate")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<List<PayrollDto>> runPayrollCalculation(
            @Valid @RequestBody PayrollCalculationRequest request,
            @AuthenticationPrincipal User manager) {
        List<PayrollDto> payrolls = payrollService.runPayrollForBranch(
                request.getMonth(), request.getYear(), manager);
        return ResponseEntity.ok(payrolls);
    }

    @GetMapping("/branch")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<List<PayrollDto>> getBranchPayroll(
            @RequestParam int month,
            @RequestParam int year,
            @AuthenticationPrincipal User manager) {
        List<PayrollDto> payrolls = payrollService.getPayrollForBranch(month, year, manager);
        return ResponseEntity.ok(payrolls);
    }

    @GetMapping("/my-payroll")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<PayrollDto> getMyPayroll(
            @RequestParam int month,
            @RequestParam int year,
            @AuthenticationPrincipal User staff) {
        PayrollDto payroll = payrollService.getMyPayroll(month, year, staff);
        return ResponseEntity.ok(payroll);
    }

    @PostMapping("/adjustments")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<PayrollAdjustmentDto> createAdjustment( // <-- (Sẽ hết lỗi ở đây)
            @Valid @RequestBody PayrollAdjustmentRequest request,
            @AuthenticationPrincipal User manager) {
        PayrollAdjustmentDto adjustment = payrollService.createAdjustment(request, manager);
        return new ResponseEntity<>(adjustment, HttpStatus.CREATED);
    }
}