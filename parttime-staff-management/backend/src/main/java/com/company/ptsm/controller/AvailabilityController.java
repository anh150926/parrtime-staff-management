// file: backend/src/main/java/com/company/ptsm/controller/AvailabilityController.java
package com.company.ptsm.controller;

import com.company.ptsm.dto.availability.AvailabilityRequest;
import com.company.ptsm.dto.availability.AvailabilityResponse;
import com.company.ptsm.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE', 'ROLE_MANAGER')")
    public ResponseEntity<AvailabilityResponse> getEmployeeAvailability(
            @RequestParam Integer employeeId,
            @RequestParam LocalDate date) {
        AvailabilityResponse response = availabilityService.getAvailability(employeeId, date);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_EMPLOYEE', 'ROLE_MANAGER')")
    public ResponseEntity<AvailabilityResponse> saveEmployeeAvailability(
            @Valid @RequestBody AvailabilityRequest request) {
        AvailabilityResponse response = availabilityService.saveAvailability(request);
        return ResponseEntity.ok(response);
    }
}