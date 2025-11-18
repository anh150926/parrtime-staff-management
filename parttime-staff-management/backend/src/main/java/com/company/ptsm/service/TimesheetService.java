/*
 * file: backend/src/main/java/com/company/ptsm/service/TimesheetService.java
 *
 * [CẢI TIẾN]
 * Service này thay thế WorkLogService cũ.
 * Xử lý nghiệp vụ Chấm công (Timesheet) và Hiệu chỉnh công.
 */
package com.company.ptsm.service;

import com.company.ptsm.dto.timesheet.CheckInRequest;
import com.company.ptsm.dto.timesheet.TimesheetEditRequest;
import com.company.ptsm.dto.timesheet.WorkLogDto;
import com.company.ptsm.exception.BusinessRuleException;
import com.company.ptsm.exception.NotFoundException;
import com.company.ptsm.model.*;
import com.company.ptsm.repository.ScheduleAssignmentRepository;
import com.company.ptsm.repository.WorkLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimesheetService {

    private final WorkLogRepository workLogRepository;
    private final ScheduleAssignmentRepository assignmentRepository;
    private final AuditLogService auditLogService; // <-- [MỚI] Tiêm AuditLog

    /**
     * VAI TRÒ 3 (Staff): Check-in
     */
    @Transactional
    public WorkLogDto staffCheckIn(CheckInRequest request, User staff) {
        // 1. Kiểm tra xem có đang check-in dở ca nào không
        if (workLogRepository.findByUserIdAndCheckOutIsNull(staff.getId()).isPresent()) {
            throw new BusinessRuleException("Bạn phải check-out ca hiện tại trước khi check-in ca mới.");
        }

        // 2. Tìm ca đã được phân công (Assignment)
        ScheduleAssignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ca làm này."));

        // 3. (Bảo mật) Đảm bảo nhân viên check-in đúng ca của mình
        if (!assignment.getUser().getId().equals(staff.getId())) {
            throw new BusinessRuleException("Bạn không được phân công cho ca làm này.");
        }

        // 4. (Logic) Đảm bảo nhân viên check-in đúng ngày
        if (!assignment.getSchedule().getScheduleDate().equals(LocalDate.now())) {
            // (Có thể nới lỏng logic này nếu cho phép check-in ca đêm hôm trước)
            // throw new BusinessRuleException("Hôm nay không phải ngày làm của ca này.");
        }

        // 5. Tạo WorkLog
        WorkLog newLog = WorkLog.builder()
                .user(staff)
                .branch(staff.getBranch())
                .checkIn(OffsetDateTime.now())
                .isEdited(false)
                .assignment(assignment) // Liên kết với ca đã xếp
                .build();

        WorkLog savedLog = workLogRepository.save(newLog);
        return mapToWorkLogDto(savedLog);
    }

    /**
     * VAI TRÒ 3 (Staff): Check-out
     */
    @Transactional
    public WorkLogDto staffCheckOut(User staff) {
        // 1. Tìm ca đang làm việc (chưa check-out)
        WorkLog activeLog = workLogRepository.findByUserIdAndCheckOutIsNull(staff.getId())
                .orElseThrow(() -> new BusinessRuleException("Bạn chưa check-in ca nào để check-out."));

        // 2. Gán giờ check-out
        activeLog.setCheckOut(OffsetDateTime.now());

        // 3. Tính toán giờ làm, phút đi muộn...
        calculateWorkLogMetrics(activeLog);

        WorkLog savedLog = workLogRepository.save(activeLog);
        return mapToWorkLogDto(savedLog);
    }

    /**
     * VAI TRÒ 2 (Manager): Hiệu chỉnh công (Sửa giờ)
     */
    @Transactional
    public WorkLogDto managerEditTimesheet(Integer workLogId, TimesheetEditRequest request, User manager) {
        WorkLog log = workLogRepository.findById(workLogId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy log chấm công."));

        // (Bảo mật) Đảm bảo Manager chỉ sửa log của cơ sở mình
        if (log.getBranch() == null || !log.getBranch().getId().equals(manager.getBranch().getId())) {
            throw new BusinessRuleException("Không có quyền sửa chấm công của cơ sở khác.");
        }

        // Ghi lại log cũ để kiểm toán
        String oldCheckIn = log.getCheckIn().toString();
        String oldCheckOut = log.getCheckOut() != null ? log.getCheckOut().toString() : "N/A";

        // Cập nhật thông tin
        log.setCheckIn(request.getNewCheckIn());
        log.setCheckOut(request.getNewCheckOut());
        log.setEdited(true);
        log.setEditReason(request.getReason());
        log.setEditedByManager(manager);

        // Tính toán lại giờ làm
        calculateWorkLogMetrics(log);

        WorkLog savedLog = workLogRepository.save(log);

        // [MỚI] Ghi lại Lịch sử Hoạt động
        String details = String.format(
                "Sửa WorkLog (ID: %d) của NV (ID: %d). Check-in: %s -> %s. Check-out: %s -> %s. Lý do: %s",
                log.getId(), log.getUser().getId(), oldCheckIn, log.getCheckIn(), oldCheckOut, log.getCheckOut(),
                log.getEditReason());
        auditLogService.logAction(manager, "EDIT_TIMESHEET", "WorkLog_" + log.getId(), details);

        return mapToWorkLogDto(savedLog);
    }

    /**
     * VAI TRÒ 2 (Manager): Xem Bảng chấm công của cơ sở
     */
    @Transactional(readOnly = true)
    public List<WorkLogDto> getTimesheetsForBranch(User manager, LocalDate startDate, LocalDate endDate) {
        OffsetDateTime start = startDate.atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime end = endDate.plusDays(1).atStartOfDay().atOffset(OffsetDateTime.now().getOffset());

        List<WorkLog> logs = workLogRepository
                .findByBranchIdAndCheckInBetweenOrderByCheckInDesc(manager.getBranch().getId(), start, end);

        return logs.stream().map(this::mapToWorkLogDto).collect(Collectors.toList());
    }

    // --- Hàm Tính toán Nội bộ ---

    /**
     * Tính toán giờ làm (actualHours) và phút đi muộn (lateMinutes)
     * cho một WorkLog.
     */
    private void calculateWorkLogMetrics(WorkLog log) {
        if (log.getCheckIn() == null || log.getCheckOut() == null) {
            log.setActualHours(BigDecimal.ZERO);
            log.setLateMinutes(0);
            return;
        }

        // 1. Tính tổng giờ làm
        Duration actualDuration = Duration.between(log.getCheckIn(), log.getCheckOut());
        BigDecimal actualHours = BigDecimal.valueOf(actualDuration.toMinutes() / 60.0)
                .setScale(2, RoundingMode.HALF_UP);
        log.setActualHours(actualHours);

        // 2. Tính phút đi muộn
        int lateMinutes = 0;
        if (log.getAssignment() != null && log.getAssignment().getSchedule() != null) {
            ShiftTemplate template = log.getAssignment().getSchedule().getShiftTemplate();
            LocalDate shiftDate = log.getAssignment().getSchedule().getScheduleDate();

            OffsetDateTime shiftStartTime = OffsetDateTime.of(
                    shiftDate,
                    template.getStartTime(),
                    log.getCheckIn().getOffset());

            if (log.getCheckIn().isAfter(shiftStartTime)) {
                lateMinutes = (int) Duration.between(shiftStartTime, log.getCheckIn()).toMinutes();
            }
        }
        log.setLateMinutes(lateMinutes);
    }

    // --- Hàm tiện ích (Helper) ---

    private WorkLogDto mapToWorkLogDto(WorkLog log) {
        User manager = log.getEditedByManager();
        String managerName = null;
        if (manager != null) {
            managerName = manager.getStaffProfile() != null ? manager.getStaffProfile().getFullName()
                    : manager.getEmail();
        }

        String staffName = "N/A";
        if (log.getUser() != null && log.getUser().getStaffProfile() != null) {
            staffName = log.getUser().getStaffProfile().getFullName();
        } else if (log.getUser() != null) {
            staffName = log.getUser().getEmail();
        }

        return WorkLogDto.builder()
                .id(log.getId())
                .userId(log.getUser().getId())
                .staffName(staffName)
                .checkIn(log.getCheckIn())
                .checkOut(log.getCheckOut())
                .actualHours(log.getActualHours())
                .lateMinutes(log.getLateMinutes())
                .isEdited(log.isEdited())
                .editReason(log.getEditReason())
                .editedByManagerName(managerName)
                .build();
    }
}