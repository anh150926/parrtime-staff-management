package com.coffee.management.controller;

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
    public ResponseEntity<ComplaintResponse> createComplaint(
            @Valid @RequestBody CreateComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(complaintService.createComplaint(request, currentUser));
    }

    /**
     * Get my complaints (Staff)
     */
    @GetMapping("/my-complaints")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(complaintService.getMyComplaints(currentUser.getId()));
    }

    /**
     * Get complaints by store (Manager)
     */
    @GetMapping("/store/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<List<ComplaintResponse>> getComplaintsByStore(
            @PathVariable Long storeId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(complaintService.getComplaintsByStore(storeId, currentUser));
    }

    /**
     * Get all complaints (Owner)
     */
    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    /**
     * Get pending complaints by store
     */
    @GetMapping("/pending/store/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<List<ComplaintResponse>> getPendingComplaints(@PathVariable Long storeId) {
        return ResponseEntity.ok(complaintService.getPendingComplaints(storeId));
    }

    /**
     * Get all pending complaints (Owner)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<ComplaintResponse>> getAllPendingComplaints() {
        return ResponseEntity.ok(complaintService.getAllPendingComplaints());
    }

    /**
     * Get complaint by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(complaintService.getComplaintById(id, currentUser));
    }

    /**
     * Respond to a complaint (Manager/Owner)
     */
    @PostMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ComplaintResponse> respondToComplaint(
            @PathVariable Long id,
            @Valid @RequestBody RespondComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(complaintService.respondToComplaint(id, request, currentUser));
    }

    /**
     * Get pending count for a store
     */
    @GetMapping("/count/pending/store/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<Map<String, Long>> getPendingCount(@PathVariable Long storeId) {
        long count = complaintService.countPendingComplaints(storeId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}



