// file: backend/src/main/java/com/company/ptsm/controller/SchedulingController.java
package com.company.ptsm.controller;

import com.company.ptsm.dto.schedule.AssignShiftRequest;
import com.company.ptsm.dto.schedule.RegisteredEmployeeDto;
import com.company.ptsm.dto.schedule.ScheduleViewResponse;
import com.company.ptsm.model.enums.DayOfWeekEnum;
import com.company.ptsm.model.enums.ShiftType;
import com.company.ptsm.service.SchedulingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/scheduling")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_MANAGER')")
public class SchedulingController {

    private final SchedulingService schedulingService;

    @GetMapping("/week-view")
    public ResponseEntity<ScheduleViewResponse> getWeekSchedule(
            @RequestParam Integer restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStartDate) {
        ScheduleViewResponse response = schedulingService.getScheduleForWeek(restaurantId, weekStartDate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/registered-employees")
    public ResponseEntity<List<RegisteredEmployeeDto>> getRegisteredEmployees(
            @RequestParam Integer restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStartDate,
            @RequestParam DayOfWeekEnum dayOfWeek,
            @RequestParam ShiftType shiftType) {
        List<RegisteredEmployeeDto> response = schedulingService.getRegisteredEmployeesForShift(
                restaurantId, weekStartDate, dayOfWeek, shiftType);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assign-shift")
    public ResponseEntity<ScheduleViewResponse> assignShift(
            @Valid @RequestBody AssignShiftRequest request) {
        ScheduleViewResponse response = schedulingService.assignEmployeesToShift(request);
        return ResponseEntity.ok(response);
    }
}