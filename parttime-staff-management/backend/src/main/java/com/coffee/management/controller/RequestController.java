package com.coffee.management.controller;

import com.coffee.management.dto.ApiResponse;
import com.coffee.management.dto.request.CreateRequestRequest;
import com.coffee.management.dto.request.RequestResponse;
import com.coffee.management.dto.request.ReviewRequestRequest;
import com.coffee.management.entity.RequestStatus;
import com.coffee.management.security.UserPrincipal;
import com.coffee.management.service.RequestService;
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
 * REST Controller for leave/shift change request endpoints
 */
@RestController
@RequestMapping("/api/v1/requests")
@Tag(name = "Requests", description = "Leave and shift change request endpoints")
public class RequestController {

    @Autowired
    private RequestService requestService;

    @PostMapping
    @Operation(summary = "Create a new request (leave or shift change)")
    public ResponseEntity<ApiResponse<RequestResponse>> createRequest(
            @Valid @RequestBody CreateRequestRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        RequestResponse response = requestService.createRequest(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Request created successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all requests")
    public ResponseEntity<ApiResponse<List<RequestResponse>>> getRequests(
            @RequestParam(required = false) RequestStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<RequestResponse> requests = requestService.getRequests(status, currentUser);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get request by ID")
    public ResponseEntity<ApiResponse<RequestResponse>> getRequestById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        RequestResponse request = requestService.getRequestById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(request));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Review (approve/reject) a request")
    public ResponseEntity<ApiResponse<RequestResponse>> reviewRequest(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequestRequest reviewRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        RequestResponse response = requestService.reviewRequest(id, reviewRequest, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Request reviewed successfully", response));
    }

    @GetMapping("/pending-count")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Get count of pending requests")
    public ResponseEntity<ApiResponse<Long>> getPendingRequestsCount(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        long count = requestService.getPendingRequestsCount(currentUser);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}








