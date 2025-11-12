// file: backend/src/main/java/com/company/ptsm/controller/WorkLogController.java
package com.company.ptsm.controller;

import com.company.ptsm.dto.worklog.CheckInRequest;
import com.company.ptsm.dto.worklog.WorkLogResponse;
import com.company.ptsm.service.WorkLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worklog")
@RequiredArgsConstructor
public class WorkLogController {

    private final WorkLogService workLogService;

    @PostMapping("/check-in")
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE', 'ROLE_MANAGER')")
    public ResponseEntity<WorkLogResponse> checkIn(@Valid @RequestBody CheckInRequest request) {
        WorkLogResponse response = workLogService.checkIn(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/check-out/{workLogId}")
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE', 'ROLE_MANAGER')")
    public ResponseEntity<WorkLogResponse> checkOut(@PathVariable Integer workLogId) {
        WorkLogResponse response = workLogService.checkOut(workLogId);
        return ResponseEntity.ok(response);
    }
}