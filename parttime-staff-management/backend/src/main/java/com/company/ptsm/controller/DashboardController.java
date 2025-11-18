/*
 * file: backend/src/main/java/com/company/ptsm/controller/DashboardController.java
 *
 * [MỚI]
 * Controller này cung cấp dữ liệu cho 3 trang Dashboard
 * của 3 vai trò.
 */
package com.company.ptsm.controller;

import com.company.ptsm.dto.dashboard.ManagerDashboardDto;
import com.company.ptsm.dto.dashboard.StaffDashboardDto;
import com.company.ptsm.dto.dashboard.SuperAdminDashboardDto;
import com.company.ptsm.model.User;
import com.company.ptsm.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * VAI TRÒ 3 (Staff): Lấy dữ liệu cho "My Dashboard"
     */
    @GetMapping("/staff")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<StaffDashboardDto> getStaffDashboard(
            @AuthenticationPrincipal User staff) {
        return ResponseEntity.ok(dashboardService.getStaffDashboard(staff));
    }

    /**
     * VAI TRÒ 2 (Manager): Lấy dữ liệu cho "Tổng quan (Dashboard)"
     */
    @GetMapping("/manager")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<ManagerDashboardDto> getManagerDashboard(
            @AuthenticationPrincipal User manager) {
        return ResponseEntity.ok(dashboardService.getManagerDashboard(manager));
    }

    /**
     * VAI TRÒ 1 (Super Admin): Lấy dữ liệu cho "Tổng quan Liên-Cơ sở"
     */
    @GetMapping("/super-admin")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<SuperAdminDashboardDto> getSuperAdminDashboard(
            @AuthenticationPrincipal User superAdmin) {
        return ResponseEntity.ok(dashboardService.getSuperAdminDashboard(superAdmin));
    }
}