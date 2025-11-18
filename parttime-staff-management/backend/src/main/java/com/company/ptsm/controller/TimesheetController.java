/*
 * file: backend/src/main/java/com/company/ptsm/controller/TimesheetController.java
 *
 * [CẢI TIẾN]
 * Controller này thay thế WorkLogController cũ.
 */
package com.company.ptsm.controller;

import com.company.ptsm.dto.timesheet.CheckInRequest;
import com.company.ptsm.dto.timesheet.TimesheetEditRequest;
import com.company.ptsm.dto.timesheet.WorkLogDto;
import com.company.ptsm.model.User;
import com.company.ptsm.service.TimesheetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/timesheet")
@RequiredArgsConstructor
public class TimesheetController {

    private final TimesheetService timesheetService;

    /**
     * VAI TRÒ 3 (Staff): API Check-in
     */
    @PostMapping("/check-in")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<WorkLogDto> staffCheckIn(
            @Valid @RequestBody CheckInRequest request,
            @AuthenticationPrincipal User staff) {
        WorkLogDto workLog = timesheetService.staffCheckIn(request, staff);
        return ResponseEntity.ok(workLog);
    }

    /**
     * VAI TRÒ 3 (Staff): API Check-out
     */
    @PostMapping("/check-out")
    @PreAuthorize("hasRole('ROLE_STAFF')")
    public ResponseEntity<WorkLogDto> staffCheckOut(
            @AuthenticationPrincipal User staff) {
        WorkLogDto workLog = timesheetService.staffCheckOut(staff);
        return ResponseEntity.ok(workLog);
    }

    /**
     * VAI TRÒ 2 (Manager): API Xem Bảng chấm công
     */
    @GetMapping("/branch")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<List<WorkLogDto>> getTimesheetsForBranch(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User manager) {
        List<WorkLogDto> logs = timesheetService.getTimesheetsForBranch(manager, startDate, endDate);
        return ResponseEntity.ok(logs);
    }

    /**
     * VAI TRÒ 2 (Manager): API Hiệu chỉnh công
     */
    @PutMapping("/edit/{workLogId}")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<WorkLogDto> managerEditTimesheet(
            @PathVariable Integer workLogId,
            @Valid @RequestBody TimesheetEditRequest request,
            @AuthenticationPrincipal User manager) {
        WorkLogDto updatedLog = timesheetService.managerEditTimesheet(workLogId, request, manager);
        return ResponseEntity.ok(updatedLog);
    }
}