package com.coffee.management.controller;

import com.coffee.management.dto.ApiResponse;
import com.coffee.management.dto.shift.*;
import com.coffee.management.security.UserPrincipal;
import com.coffee.management.service.ShiftRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Shift Registration", description = "Shift registration endpoints")
public class ShiftRegistrationController {

    @Autowired
    private ShiftRegistrationService registrationService;

    @PostMapping("/stores/{storeId}/shift-templates")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Create shift template for registration")
    public ResponseEntity<ApiResponse<ShiftTemplateResponse>> createShiftTemplate(
            @PathVariable Long storeId,
            @Valid @RequestBody CreateShiftTemplateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ShiftTemplateResponse template = registrationService.createShiftTemplate(storeId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Shift template created successfully", template));
    }

    @GetMapping("/stores/{storeId}/shift-templates")
    @Operation(summary = "Get shift templates by store")
    public ResponseEntity<ApiResponse<List<ShiftTemplateResponse>>> getShiftTemplates(@PathVariable Long storeId) {
        List<ShiftTemplateResponse> templates = registrationService.getShiftTemplates(storeId);
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    @PostMapping("/shift-templates/{templateId}/register")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Register for a shift")
    public ResponseEntity<ApiResponse<ShiftRegistrationResponse>> registerShift(
            @PathVariable Long templateId,
            @Valid @RequestBody RegisterShiftRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ShiftRegistrationResponse registration = registrationService.registerShift(templateId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Shift registered successfully", registration));
    }

    @GetMapping("/shift-registrations/week")
    @Operation(summary = "Get registrations for a week")
    public ResponseEntity<ApiResponse<List<ShiftRegistrationResponse>>> getRegistrationsForWeek(
            @RequestParam Long storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        List<ShiftRegistrationResponse> registrations = registrationService.getRegistrationsForWeek(storeId, weekStart);
        return ResponseEntity.ok(ApiResponse.success(registrations));
    }

    @GetMapping("/my-registrations/week")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Get my registrations for a week")
    public ResponseEntity<ApiResponse<List<ShiftRegistrationResponse>>> getMyRegistrationsForWeek(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<ShiftRegistrationResponse> registrations = registrationService.getMyRegistrationsForWeek(currentUser.getId(), weekStart);
        return ResponseEntity.ok(ApiResponse.success(registrations));
    }

    @GetMapping("/shift-templates/{templateId}/registrations")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Get registered users for a shift template on a specific date")
    public ResponseEntity<ApiResponse<List<ShiftRegistrationResponse>>> getRegisteredUsersForShift(
            @PathVariable Long templateId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<ShiftRegistrationResponse> registrations = registrationService.getRegisteredUsersForShift(templateId, date);
        return ResponseEntity.ok(ApiResponse.success(registrations));
    }

    @DeleteMapping("/shift-registrations/{registrationId}")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Cancel a registration")
    public ResponseEntity<ApiResponse<Void>> cancelRegistration(
            @PathVariable Long registrationId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        registrationService.cancelRegistration(registrationId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Registration cancelled successfully", null));
    }

    @PostMapping("/shift-templates/{templateId}/finalize")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Finalize shift (lock registrations for a specific date)")
    public ResponseEntity<ApiResponse<Void>> finalizeShift(
            @PathVariable Long templateId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate finalizationDate,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        registrationService.finalizeShift(templateId, finalizationDate, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Shift finalized successfully", null));
    }

    @GetMapping("/shift-templates/{templateId}/is-finalized")
    @Operation(summary = "Check if shift is finalized for a specific date")
    public ResponseEntity<ApiResponse<Boolean>> isShiftFinalized(
            @PathVariable Long templateId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        boolean isFinalized = registrationService.isShiftFinalized(templateId, date);
        return ResponseEntity.ok(ApiResponse.success(isFinalized));
    }
}
