package com.coffee.management.controller;

import com.coffee.management.dto.ApiResponse;
import com.coffee.management.dto.payroll.PayrollResponse;
import com.coffee.management.dto.payroll.UpdatePayrollRequest;
import com.coffee.management.security.UserPrincipal;
import com.coffee.management.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for payroll management endpoints
 */
@RestController
@RequestMapping("/api/v1/payrolls")
@Tag(name = "Payrolls", description = "Payroll management endpoints")
public class PayrollController {

    @Autowired
    private PayrollService payrollService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Generate payroll for a month")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> generatePayroll(
            @RequestParam String month,
            @RequestParam(required = false) Long storeId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<PayrollResponse> payrolls = payrollService.generatePayroll(month, storeId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Payroll generated successfully", payrolls));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get payroll for a user by month")
    public ResponseEntity<ApiResponse<PayrollResponse>> getPayrollByUserAndMonth(
            @PathVariable Long userId,
            @RequestParam String month,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        PayrollResponse payroll = payrollService.getPayrollByUserAndMonth(userId, month, currentUser);
        return ResponseEntity.ok(ApiResponse.success(payroll));
    }

    @GetMapping("/user/{userId}/history")
    @Operation(summary = "Get payroll history for a user")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getPayrollHistory(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<PayrollResponse> payrolls = payrollService.getPayrollHistoryForUser(userId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(payrolls));
    }

    @GetMapping("/my-history")
    @Operation(summary = "Get current user's payroll history")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getMyPayrollHistory(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<PayrollResponse> payrolls = payrollService.getPayrollHistoryForUser(currentUser.getId(), currentUser);
        return ResponseEntity.ok(ApiResponse.success(payrolls));
    }

    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Get payrolls by store and month")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getPayrollsByStoreAndMonth(
            @PathVariable Long storeId,
            @RequestParam String month,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<PayrollResponse> payrolls = payrollService.getPayrollsByStoreAndMonth(storeId, month, currentUser);
        return ResponseEntity.ok(ApiResponse.success(payrolls));
    }

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Get all payrolls by month")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getPayrollsByMonth(
            @RequestParam String month) {
        List<PayrollResponse> payrolls = payrollService.getPayrollsByMonth(month);
        return ResponseEntity.ok(ApiResponse.success(payrolls));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Update payroll (adjustments, status)")
    public ResponseEntity<ApiResponse<PayrollResponse>> updatePayroll(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePayrollRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        PayrollResponse payroll = payrollService.updatePayroll(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Payroll updated successfully", payroll));
    }

    @PostMapping("/batch-approve")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Batch approve payrolls")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> batchApprove(
            @RequestBody List<Long> ids,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<PayrollResponse> payrolls = payrollService.batchApprovePayrolls(ids, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Payrolls approved successfully", payrolls));
    }

    @PostMapping("/batch-paid")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Batch mark payrolls as paid")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> batchMarkPaid(
            @RequestBody List<Long> ids,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<PayrollResponse> payrolls = payrollService.batchMarkPaid(ids, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Payrolls marked as paid successfully", payrolls));
    }
}
