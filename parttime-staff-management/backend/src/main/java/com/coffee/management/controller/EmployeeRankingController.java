package com.coffee.management.controller;

import com.coffee.management.dto.ApiResponse;
import com.coffee.management.dto.report.EmployeeRankingResponse;
import com.coffee.management.service.EmployeeRankingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rankings")
@Tag(name = "Employee Rankings", description = "Employee performance ranking endpoints")
@PreAuthorize("hasRole('OWNER')")
public class EmployeeRankingController {

    @Autowired
    private EmployeeRankingService rankingService;

    /**
     * Get employee rankings
     */
    @GetMapping
    @Operation(summary = "Get employee rankings for a specific month")
    public ResponseEntity<ApiResponse<List<EmployeeRankingResponse>>> getEmployeeRankings(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Long storeId) {
        List<EmployeeRankingResponse> rankings = rankingService.getEmployeeRankings(year, month, storeId);
        return ResponseEntity.ok(ApiResponse.success(rankings));
    }

    /**
     * Get top performers (most hardworking)
     */
    @GetMapping("/top")
    @Operation(summary = "Get top performing employees")
    public ResponseEntity<ApiResponse<List<EmployeeRankingResponse>>> getTopPerformers(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Long storeId) {
        List<EmployeeRankingResponse> topPerformers = rankingService.getTopPerformers(limit, storeId);
        return ResponseEntity.ok(ApiResponse.success(topPerformers));
    }

    /**
     * Get lowest performers (need improvement)
     */
    @GetMapping("/bottom")
    @Operation(summary = "Get employees who need improvement")
    public ResponseEntity<ApiResponse<List<EmployeeRankingResponse>>> getLowestPerformers(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Long storeId) {
        List<EmployeeRankingResponse> lowestPerformers = rankingService.getLowestPerformers(limit, storeId);
        return ResponseEntity.ok(ApiResponse.success(lowestPerformers));
    }
}



