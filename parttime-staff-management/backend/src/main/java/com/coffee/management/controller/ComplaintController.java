package com.coffee.management.controller;

import com.coffee.management.dto.ApiResponse;
import com.coffee.management.dto.complaint.*;
import com.coffee.management.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.coffee.management.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    /**
     * Create a new complaint (Staff only)
     */
    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @RequestBody CreateComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ComplaintResponse complaint = complaintService.createComplaint(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Gửi khiếu nại thành công", complaint));
    }

    /**
     * Get my complaints (Staff)
     */
    @GetMapping("/my-complaints")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getMyComplaints(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<ComplaintResponse> complaints = complaintService.getMyComplaints(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    /**
     * Get complaints by store (Manager)
     */
    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getComplaintsByStore(
            @PathVariable Long storeId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<ComplaintResponse> complaints = complaintService.getComplaintsByStore(storeId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    /**
     * Get all complaints (Owner)
     */
    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getAllComplaints() {
        List<ComplaintResponse> complaints = complaintService.getAllComplaints();
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    /**
     * Get pending complaints by store
     */
    @GetMapping("/pending/store/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getPendingComplaints(@PathVariable Long storeId) {
        List<ComplaintResponse> complaints = complaintService.getPendingComplaints(storeId);
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    /**
     * Get all pending complaints (Owner)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getAllPendingComplaints() {
        List<ComplaintResponse> complaints = complaintService.getAllPendingComplaints();
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    /**
     * Get complaint by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ComplaintResponse complaint = complaintService.getComplaintById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(complaint));
    }

    /**
     * Respond to a complaint (Manager/Owner)
     */
    @PostMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> respondToComplaint(
            @PathVariable Long id,
            @Valid @RequestBody RespondComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ComplaintResponse complaint = complaintService.respondToComplaint(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Đã phản hồi khiếu nại", complaint));
    }

    /**
     * Get pending count for a store
     */
    @GetMapping("/count/pending/store/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getPendingCount(@PathVariable Long storeId) {
        long count = complaintService.countPendingComplaints(storeId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }
}



