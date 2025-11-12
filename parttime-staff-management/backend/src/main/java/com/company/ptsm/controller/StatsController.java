// file: backend/src/main/java/com/company/ptsm/controller/StatsController.java
package com.company.ptsm.controller;

import com.company.ptsm.dto.stats.BestEmployeeResponse;
import com.company.ptsm.dto.stats.StatsRequest;
import com.company.ptsm.service.StatsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_MANAGER')")
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/best-employees")
    public ResponseEntity<List<BestEmployeeResponse>> getBestEmployees(
            @Valid StatsRequest request) {
        List<BestEmployeeResponse> response = statsService.getBestEmployees(request);
        return ResponseEntity.ok(response);
    }
}