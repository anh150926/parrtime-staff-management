package com.coffee.management.controller;

import com.coffee.management.dto.ApiResponse;
import com.coffee.management.dto.shift.*;
import com.coffee.management.security.UserPrincipal;
import com.coffee.management.service.ShiftService;
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
 * REST Controller for shift management endpoints
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Shifts", description = "Shift management endpoints")
public class ShiftController {

    @Autowired
    private ShiftService shiftService;

    @GetMapping("/stores/{storeId}/shifts")
    @Operation(summary = "Get shifts by store")
    public ResponseEntity<ApiResponse<List<ShiftResponse>>> getShiftsByStore(
            @PathVariable Long storeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<ShiftResponse> shifts = shiftService.getShiftsByStore(storeId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(shifts));
    }

    @GetMapping("/shifts/{id}")
    @Operation(summary = "Get shift by ID")
    public ResponseEntity<ApiResponse<ShiftResponse>> getShiftById(@PathVariable Long id) {
        ShiftResponse shift = shiftService.getShiftById(id);
        return ResponseEntity.ok(ApiResponse.success(shift));
    }

    @PostMapping("/stores/{storeId}/shifts")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Create a new shift")
    public ResponseEntity<ApiResponse<ShiftResponse>> createShift(
            @PathVariable Long storeId,
            @Valid @RequestBody CreateShiftRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ShiftResponse shift = shiftService.createShift(storeId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Shift created successfully", shift));
    }

    @PutMapping("/shifts/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Update an existing shift")
    public ResponseEntity<ApiResponse<ShiftResponse>> updateShift(
            @PathVariable Long id,
            @Valid @RequestBody CreateShiftRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ShiftResponse shift = shiftService.updateShift(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Shift updated successfully", shift));
    }

    @DeleteMapping("/shifts/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Delete a shift")
    public ResponseEntity<ApiResponse<Void>> deleteShift(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        shiftService.deleteShift(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Shift deleted successfully", null));
    }

    @PostMapping("/shifts/{id}/assign")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Assign staff to a shift")
    public ResponseEntity<ApiResponse<ShiftResponse>> assignStaff(
            @PathVariable Long id,
            @Valid @RequestBody AssignShiftRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ShiftResponse shift = shiftService.assignStaff(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Staff assigned successfully", shift));
    }

    @PutMapping("/shifts/{id}/assignment")
    @Operation(summary = "Update assignment status (confirm/decline)")
    public ResponseEntity<ApiResponse<ShiftAssignmentResponse>> updateAssignment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAssignmentRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ShiftAssignmentResponse assignment = shiftService.updateAssignmentStatus(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Assignment updated successfully", assignment));
    }

    @DeleteMapping("/shifts/{shiftId}/assignments/{userId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Remove staff assignment from a shift")
    public ResponseEntity<ApiResponse<ShiftResponse>> removeAssignment(
            @PathVariable Long shiftId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ShiftResponse shift = shiftService.removeAssignment(shiftId, userId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Assignment removed successfully", shift));
    }

    @GetMapping("/my-shifts")
    @Operation(summary = "Get shifts assigned to current user")
    public ResponseEntity<ApiResponse<List<ShiftResponse>>> getMyShifts(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<ShiftResponse> shifts = shiftService.getMyShifts(currentUser.getId(), startDate);
        return ResponseEntity.ok(ApiResponse.success(shifts));
    }
}








