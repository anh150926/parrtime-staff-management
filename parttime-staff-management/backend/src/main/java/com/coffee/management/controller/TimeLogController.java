package com.coffee.management.controller;

import com.coffee.management.dto.ApiResponse;
import com.coffee.management.dto.timelog.CheckInRequest;
import com.coffee.management.dto.timelog.ManualTimeLogRequest;
import com.coffee.management.dto.timelog.TimeLogResponse;
import com.coffee.management.security.UserPrincipal;
import com.coffee.management.service.TimeLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller for time tracking endpoints
 */
@RestController
@RequestMapping("/api/v1/time")
@Tag(name = "Time Tracking", description = "Check-in/Check-out endpoints")
public class TimeLogController {

    @Autowired
    private TimeLogService timeLogService;

    @PostMapping("/checkin")
    @Operation(summary = "Check in for work")
    public ResponseEntity<ApiResponse<TimeLogResponse>> checkIn(
            @RequestBody(required = false) CheckInRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long shiftId = request != null ? request.getShiftId() : null;
        TimeLogResponse timeLog = timeLogService.checkIn(shiftId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Checked in successfully", timeLog));
    }

    @PostMapping("/checkout")
    @Operation(summary = "Check out from work")
    public ResponseEntity<ApiResponse<TimeLogResponse>> checkOut(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TimeLogResponse timeLog = timeLogService.checkOut(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Checked out successfully", timeLog));
    }

    @GetMapping("/current")
    @Operation(summary = "Get current check-in status")
    public ResponseEntity<ApiResponse<TimeLogResponse>> getCurrentCheckIn(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TimeLogResponse timeLog = timeLogService.getCurrentCheckIn(currentUser);
        return ResponseEntity.ok(ApiResponse.success(timeLog));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get time logs for a user")
    public ResponseEntity<ApiResponse<List<TimeLogResponse>>> getTimeLogsByUser(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<TimeLogResponse> logs = timeLogService.getTimeLogsByUser(userId, startDate, endDate, currentUser);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Get time logs for a store")
    public ResponseEntity<ApiResponse<List<TimeLogResponse>>> getTimeLogsByStore(
            @PathVariable Long storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<TimeLogResponse> logs = timeLogService.getTimeLogsByStore(storeId, startDate, endDate, currentUser);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @PostMapping("/manual")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Create manual time log (for corrections)")
    public ResponseEntity<ApiResponse<TimeLogResponse>> createManualTimeLog(
            @Valid @RequestBody ManualTimeLogRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TimeLogResponse timeLog = timeLogService.createManualTimeLog(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Manual time log created successfully", timeLog));
    }
}








