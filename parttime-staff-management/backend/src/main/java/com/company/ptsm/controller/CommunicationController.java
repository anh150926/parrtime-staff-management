/*
 * file: backend/src/main/java/com/company/ptsm/controller/CommunicationController.java
 *
 * [MỚI]
 * Controller cho nghiệp vụ Giao tiếp (Thông báo, Khiếu nại, Khảo sát).
 */
package com.company.ptsm.controller;

import com.company.ptsm.dto.communication.*;
import com.company.ptsm.model.Poll;
import com.company.ptsm.model.User;
import com.company.ptsm.service.CommunicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communication")
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationService communicationService;

    // --- API cho Thông báo (Announcements) ---

    @PostMapping("/announcements")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<AnnouncementDto> createAnnouncement(
            @Valid @RequestBody AnnouncementDto dto,
            @AuthenticationPrincipal User author) {
        AnnouncementDto created = communicationService.createAnnouncement(dto, author);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/announcements")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<AnnouncementDto>> getAnnouncements(
            @AuthenticationPrincipal User user) {
        List<AnnouncementDto> announcements = communicationService.getAnnouncements(user);
        return ResponseEntity.ok(announcements);
    }

    // --- API cho Khiếu nại (Complaints) ---

    @PostMapping("/complaints")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<ComplaintDto> createComplaint(
            @Valid @RequestBody ComplaintDto dto, // Staff chỉ cần gửi "content"
            @AuthenticationPrincipal User staff) {
        ComplaintDto created = communicationService.createComplaint(dto, staff);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/complaints/my-complaints")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<List<ComplaintDto>> getMyComplaints(
            @AuthenticationPrincipal User staff) {
        List<ComplaintDto> complaints = communicationService.getMyComplaints(staff);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/complaints/branch")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<List<ComplaintDto>> getBranchComplaints(
            @AuthenticationPrincipal User manager) {
        List<ComplaintDto> complaints = communicationService.getComplaintsForBranch(manager);
        return ResponseEntity.ok(complaints);
    }

    @PutMapping("/complaints/{id}/respond")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<ComplaintDto> respondToComplaint(
            @PathVariable Integer id,
            @Valid @RequestBody ComplaintResponseDto dto,
            @AuthenticationPrincipal User manager) {
        ComplaintDto updated = communicationService.respondToComplaint(id, dto, manager);
        return ResponseEntity.ok(updated);
    }

    // --- API cho Khảo sát (Polls) ---

    @PostMapping("/polls")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> createPoll(
            @Valid @RequestBody PollDto dto,
            @AuthenticationPrincipal User manager) {
        communicationService.createPoll(dto, manager);
        return new ResponseEntity<>("Tạo khảo sát thành công.", HttpStatus.CREATED);
    }

    @GetMapping("/polls/active")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_STAFF')")
    public ResponseEntity<List<Poll>> getActivePolls(
            @AuthenticationPrincipal User user) {
        List<Poll> polls = communicationService.getActivePolls(user);
        return ResponseEntity.ok(polls);
    }

    @PostMapping("/polls/{pollId}/vote")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<?> voteOnPoll(
            @PathVariable Integer pollId,
            @Valid @RequestBody PollVoteDto dto,
            @AuthenticationPrincipal User staff) {
        communicationService.voteOnPoll(pollId, dto, staff);
        return ResponseEntity.ok("Bỏ phiếu thành công.");
    }
}