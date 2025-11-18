/*
 * file: backend/src/main/java/com/company/ptsm/controller/ScheduleController.java
 *
 * [CẢI TIẾN]
 * Controller chính cho nghiệp vụ Lịch làm việc (Scheduling).
 * Thay thế SchedulingController và AvailabilityController cũ.
 */
package com.company.ptsm.controller;

import com.company.ptsm.dto.schedule.ScheduleCreateRequest;
import com.company.ptsm.dto.schedule.ScheduleViewDto;
import com.company.ptsm.dto.schedule.ShiftTemplateDto;
import com.company.ptsm.model.User;
import com.company.ptsm.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedule") // Tiền tố chung /api/schedule
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    // --- API cho Mẫu Ca (Manager) ---

    /**
     * VAI TRÒ 2: Tạo Mẫu Ca (Template)
     */
    @PostMapping("/templates")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<ShiftTemplateDto> createShiftTemplate(
            @Valid @RequestBody ShiftTemplateDto dto,
            @AuthenticationPrincipal User manager
    ) {
        ShiftTemplateDto createdTemplate = scheduleService.createShiftTemplate(dto, manager);
        return new ResponseEntity<>(createdTemplate, HttpStatus.CREATED);
    }

    /**
     * VAI TRÒ 2: Lấy danh sách Mẫu Ca của cơ sở
     */
    @GetMapping("/templates")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<List<ShiftTemplateDto>> getShiftTemplates(
            @AuthenticationPrincipal User manager
    ) {
        List<ShiftTemplateDto> templates = scheduleService.getShiftTemplatesForBranch(manager);
        return ResponseEntity.ok(templates);
    }
    
    /**
     * VAI TRÒ 2: Xóa Mẫu Ca
     */
    @DeleteMapping("/templates/{templateId}")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<Void> deleteShiftTemplate(
            @PathVariable Integer templateId,
            @AuthenticationPrincipal User manager
    ) {
        scheduleService.deleteShiftTemplate(templateId, manager);
        return ResponseEntity.noContent().build();
    }

    // --- API cho Lịch làm (Schedule) ---

    /**
     * VAI TRÒ 2: Tạo Ca Trống (Tạo 1 Schedule)
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<ScheduleViewDto> createSchedule(
            @Valid @RequestBody ScheduleCreateRequest request,
            @AuthenticationPrincipal User manager
    ) {
        ScheduleViewDto createdSchedule = scheduleService.createSchedule(request, manager);
        return new ResponseEntity<>(createdSchedule, HttpStatus.CREATED);
    }

    /**
     * VAI TRÒ 2 & 3: Xem Lịch Tổng (Theo tuần)
     * (Dùng cho cả Manager xem lịch tổng và Staff xem ca trống)
     */
    @GetMapping("/week")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_STAFF')")
    public ResponseEntity<List<ScheduleViewDto>> getScheduleForWeek(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStartDate,
            @AuthenticationPrincipal User user
    ) {
        List<ScheduleViewDto> scheduleViews = scheduleService.getScheduleForWeek(user, weekStartDate);
        return ResponseEntity.ok(scheduleViews);
    }
    
    /**
     * VAI TRÒ 3: Nhân viên Đăng ký Ca
     * (API này được chuyển sang RequestController để quản lý tập trung)
     */
    // @PostMapping("/register/{scheduleId}") ...
    
    
    /**
     * VAI TRÒ 2: Manager Tự gán nhân viên vào ca (Xếp lịch thủ công)
     */
    @PostMapping("/assign/{scheduleId}/staff/{staffId}")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> managerAssignStaff(
            @PathVariable Integer scheduleId,
            @PathVariable Integer staffId,
            @AuthenticationPrincipal User manager
    ) {
        scheduleService.managerAssignStaffToShift(scheduleId, staffId, manager);
        return ResponseEntity.ok("Gán nhân viên thành công.");
    }
}