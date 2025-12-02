package com.coffee.management.controller;

import com.coffee.management.dto.ApiResponse;
import com.coffee.management.dto.report.StoreReportResponse;
import com.coffee.management.dto.report.SystemReportResponse;
import com.coffee.management.security.UserPrincipal;
import com.coffee.management.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for report endpoints
 */
@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports", description = "Report endpoints")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Get report for a specific store")
    public ResponseEntity<ApiResponse<StoreReportResponse>> getStoreReport(
            @PathVariable Long storeId,
            @RequestParam String month,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        StoreReportResponse report = reportService.getStoreReport(storeId, month, currentUser);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/system")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Get system-wide report")
    public ResponseEntity<ApiResponse<SystemReportResponse>> getSystemReport(
            @RequestParam String month,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        SystemReportResponse report = reportService.getSystemReport(month, currentUser);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}








