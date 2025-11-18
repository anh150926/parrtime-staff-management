/*
 * file: backend/src/main/java/com/company/ptsm/controller/RequestController.java
 *
 * [MỚI]
 * Controller này xử lý tất cả các API liên quan đến Yêu cầu và Phê duyệt
 * (Đơn nghỉ, Đăng ký ca, Chợ ca, Báo bận...).
 */
package com.company.ptsm.controller;

import com.company.ptsm.dto.common.ApprovalDto;
import com.company.ptsm.dto.schedule.LeaveRequestDto;
import com.company.ptsm.dto.schedule.ScheduleAssignmentDto;
import com.company.ptsm.dto.schedule.ShiftMarketDto;
import com.company.ptsm.dto.schedule.StaffAvailabilityDto;
import com.company.ptsm.model.User;
import com.company.ptsm.service.RequestService;
import com.company.ptsm.service.ScheduleService; // Cần để gọi hàm đăng ký ca
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests") // Tiền tố chung là /api/requests
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;
    private final ScheduleService scheduleService; // Tiêm ScheduleService

    // --- API cho Đơn Xin Nghỉ (Leave Request) ---

    /**
     * VAI TRÒ 3 (Staff): Gửi đơn xin nghỉ
     */
    @PostMapping("/leave")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<LeaveRequestDto> createLeaveRequest(
            @Valid @RequestBody LeaveRequestDto dto,
            @AuthenticationPrincipal User staff) {
        LeaveRequestDto createdRequest = requestService.createLeaveRequest(dto, staff);
        return new ResponseEntity<>(createdRequest, HttpStatus.CREATED);
    }

    /**
     * VAI TRÒ 2 (Manager): Lấy danh sách đơn xin nghỉ PENDING của cơ sở
     */
    @GetMapping("/leave/pending")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<List<LeaveRequestDto>> getPendingLeaveRequests(
            @AuthenticationPrincipal User manager) {
        List<LeaveRequestDto> requests = requestService.getPendingLeaveRequests(manager);
        return ResponseEntity.ok(requests);
    }

    /**
     * VAI TRÒ 2 (Manager): Duyệt (Approve/Reject) đơn xin nghỉ
     */
    @PutMapping("/leave/{leaveId}/approval")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<LeaveRequestDto> approveOrRejectLeave(
            @PathVariable Integer leaveId,
            @Valid @RequestBody ApprovalDto dto,
            @AuthenticationPrincipal User manager) {
        LeaveRequestDto updatedRequest = requestService.approveOrRejectLeave(leaveId, dto, manager);
        return ResponseEntity.ok(updatedRequest);
    }

    // --- API cho Đăng Ký Ca (Schedule Registration) ---

    /**
     * VAI TRÒ 3: Nhân viên Đăng ký Ca
     * 
     * @param scheduleId ID của Ca trống (Schedule) mà NV muốn đăng ký
     */
    @PostMapping("/registration/{scheduleId}")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<ScheduleAssignmentDto> staffRegisterForShift(
            @PathVariable Integer scheduleId,
            @AuthenticationPrincipal User staff) {
        // Gọi hàm từ ScheduleService
        ScheduleAssignmentDto assignment = scheduleService.staffRegisterForShift(scheduleId, staff);
        return new ResponseEntity<>(assignment, HttpStatus.CREATED);
    }

    /**
     * VAI TRÒ 2 (Manager): Lấy danh sách đăng ký ca PENDING của cơ sở
     */
    @GetMapping("/registration/pending")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<List<ScheduleAssignmentDto>> getPendingRegistrations(
            @AuthenticationPrincipal User manager) {
        List<ScheduleAssignmentDto> assignments = requestService.getPendingRegistrations(manager);
        return ResponseEntity.ok(assignments);
    }

    /**
     * VAI TRÒ 2 (Manager): Duyệt (Approve/Reject) đăng ký ca
     */
    @PutMapping("/registration/{assignmentId}/approval")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<ScheduleAssignmentDto> approveOrRejectRegistration(
            @PathVariable Integer assignmentId,
            @Valid @RequestBody ApprovalDto dto,
            @AuthenticationPrincipal User manager) {
        ScheduleAssignmentDto updatedAssignment = requestService.approveOrRejectRegistration(assignmentId, dto,
                manager);
        return ResponseEntity.ok(updatedAssignment);
    }

    // --- API cho Chợ Ca (Shift Market) ---

    /**
     * VAI TRÒ 3 (Staff): API Đăng "bán" ca
     * 
     * @param assignmentId ID của ca (ScheduleAssignment) mà nhân viên muốn bán
     */
    @PostMapping("/market/post/{assignmentId}")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<ShiftMarketDto> postShiftToMarket(
            @PathVariable Integer assignmentId,
            @AuthenticationPrincipal User staff) {
        ShiftMarketDto postedShift = requestService.postShiftToMarket(assignmentId, staff);
        return new ResponseEntity<>(postedShift, HttpStatus.CREATED);
    }

    /**
     * VAI TRÒ 3 (Staff): API Lấy danh sách ca đang bán
     */
    @GetMapping("/market/available")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<List<ShiftMarketDto>> getAvailableMarketShifts(
            @AuthenticationPrincipal User staff) {
        List<ShiftMarketDto> shifts = requestService.getAvailableMarketShifts(staff);
        return ResponseEntity.ok(shifts);
    }

    /**
     * VAI TRÒ 3 (Staff): API "Nhận" ca
     * 
     * @param marketId ID của tin đăng bán (ShiftMarket)
     */
    @PutMapping("/market/claim/{marketId}")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<ShiftMarketDto> claimShiftFromMarket(
            @PathVariable Integer marketId,
            @AuthenticationPrincipal User claimingStaff) {
        ShiftMarketDto claimedShift = requestService.claimShiftFromMarket(marketId, claimingStaff);
        return ResponseEntity.ok(claimedShift);
    }

    /**
     * VAI TRÒ 2 (Manager): API Lấy danh sách ca đang chờ duyệt (CLAIMED)
     */
    @GetMapping("/market/pending")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<List<ShiftMarketDto>> getPendingMarketRequests(
            @AuthenticationPrincipal User manager) {
        List<ShiftMarketDto> requests = requestService.getPendingMarketRequests(manager);
        return ResponseEntity.ok(requests);
    }

    /**
     * VAI TRÒ 2 (Manager): API Duyệt (Approve / Reject) yêu cầu đổi ca
     */
    @PutMapping("/market/{marketId}/approval")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<ShiftMarketDto> approveOrRejectShiftMarket(
            @PathVariable Integer marketId,
            @Valid @RequestBody ApprovalDto dto,
            @AuthenticationPrincipal User manager) {
        ShiftMarketDto updatedMarket = requestService.approveOrRejectShiftMarket(marketId, dto, manager);
        return ResponseEntity.ok(updatedMarket);
    }

    // --- API cho Báo Bận (Unavailability) ---

    /**
     * VAI TRÒ 3 (Staff): Đăng ký một lịch bận (VD: Lịch học)
     */
    @PostMapping("/unavailability")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<StaffAvailabilityDto> createUnavailability(
            @Valid @RequestBody StaffAvailabilityDto dto,
            @AuthenticationPrincipal User staff) {
        StaffAvailabilityDto created = requestService.createUnavailability(dto, staff);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * VAI TRÒ 3 (Staff): Lấy danh sách lịch bận của tôi
     */
    @GetMapping("/my-unavailability")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<List<StaffAvailabilityDto>> getMyUnavailabilities(
            @AuthenticationPrincipal User staff) {
        List<StaffAvailabilityDto> availabilities = requestService.getMyUnavailabilities(staff);
        return ResponseEntity.ok(availabilities);
    }

    /**
     * VAI TRÒ 3 (Staff): Xóa một lịch bận
     */
    @DeleteMapping("/unavailability/{id}")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<Void> deleteUnavailability(
            @PathVariable Integer id,
            @AuthenticationPrincipal User staff) {
        requestService.deleteUnavailability(id, staff);
        return ResponseEntity.noContent().build();
    }
}