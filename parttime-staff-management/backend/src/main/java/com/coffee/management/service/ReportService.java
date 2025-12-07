package com.coffee.management.service;

import com.coffee.management.dto.report.StoreReportResponse;
import com.coffee.management.dto.report.SystemReportResponse;
import com.coffee.management.entity.RequestStatus;
import com.coffee.management.entity.Role;
import com.coffee.management.entity.Store;
import com.coffee.management.exception.ForbiddenException;
import com.coffee.management.exception.ResourceNotFoundException;
import com.coffee.management.repository.*;
import com.coffee.management.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for generating reports
 */
@Service
@Transactional(readOnly = true)
public class ReportService {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private TimeLogRepository timeLogRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ShiftAssignmentRepository shiftAssignmentRepository;

    /**
     * Generate report for a specific store
     */
    public StoreReportResponse getStoreReport(Long storeId, String month, UserPrincipal currentUser) {
        // Check permission
        if (currentUser.getRole().equals("MANAGER") && !storeId.equals(currentUser.getStoreId())) {
            throw new ForbiddenException("You can only view reports for your store");
        }

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));

        YearMonth yearMonth = YearMonth.parse(month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        // Get statistics
        int totalStaff = (int) userRepository.countStaffByStore(storeId);
        long totalShifts = shiftRepository.countByStoreAndMonth(storeId, yearMonth.getMonthValue(), yearMonth.getYear());
        
        Long totalMinutes = timeLogRepository.sumDurationByStoreAndDateRange(storeId, startDate, endDate);
        BigDecimal totalHoursWorked = totalMinutes != null ? 
                BigDecimal.valueOf(totalMinutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        BigDecimal totalPayroll = payrollRepository.sumTotalPayByStoreAndMonth(storeId, month);
        if (totalPayroll == null) totalPayroll = BigDecimal.ZERO;

        // Request statistics
        List<com.coffee.management.entity.Request> storeRequests = requestRepository.findByStoreId(storeId);
        int pendingRequests = (int) storeRequests.stream().filter(r -> r.getStatus() == RequestStatus.PENDING).count();
        int approvedRequests = (int) storeRequests.stream().filter(r -> r.getStatus() == RequestStatus.APPROVED).count();
        int rejectedRequests = (int) storeRequests.stream().filter(r -> r.getStatus() == RequestStatus.REJECTED).count();

        // Task statistics - count tasks created in the month
        long totalTasks = taskRepository.countByStoreAndDateRange(storeId, startDate, endDate);
        long completedTasks = taskRepository.countCompletedByStoreAndDateRange(storeId, startDate, endDate);
        long overdueTasks = taskRepository.countOverdueByStoreAndDateRange(storeId, LocalDateTime.now(), startDate, endDate);
        
        // Count by status - tasks created in the month
        List<com.coffee.management.entity.Task> tasks = taskRepository.findByStoreIdOrderByDueDateAsc(storeId);
        long pendingTasks = tasks.stream()
                .filter(t -> t.getStatus() == com.coffee.management.entity.TaskStatus.PENDING 
                        && !t.getCreatedAt().isBefore(startDate) 
                        && !t.getCreatedAt().isAfter(endDate))
                .count();
        long inProgressTasks = tasks.stream()
                .filter(t -> t.getStatus() == com.coffee.management.entity.TaskStatus.IN_PROGRESS 
                        && !t.getCreatedAt().isBefore(startDate) 
                        && !t.getCreatedAt().isAfter(endDate))
                .count();

        // Calculate attendance and punctuality metrics
        AttendanceMetrics attendanceMetrics = calculateAttendanceMetrics(storeId, startDate, endDate);

        return StoreReportResponse.builder()
                .storeId(storeId)
                .storeName(store.getName())
                .month(month)
                .totalStaff(totalStaff)
                .totalShifts(totalShifts)
                .totalHoursWorked(totalHoursWorked)
                .totalPayroll(totalPayroll)
                .pendingRequests(pendingRequests)
                .approvedRequests(approvedRequests)
                .rejectedRequests(rejectedRequests)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .overdueTasks(overdueTasks)
                .pendingTasks(pendingTasks)
                .inProgressTasks(inProgressTasks)
                .totalAssignedShifts(attendanceMetrics.totalAssignedShifts)
                .attendedShifts(attendanceMetrics.attendedShifts)
                .missedShifts(attendanceMetrics.missedShifts)
                .attendanceRate(attendanceMetrics.attendanceRate)
                .lateCheckIns(attendanceMetrics.lateCheckIns)
                .earlyCheckOuts(attendanceMetrics.earlyCheckOuts)
                .punctualityRate(attendanceMetrics.punctualityRate)
                .build();
    }

    /**
     * Generate system-wide report (Owner only)
     */
    public SystemReportResponse getSystemReport(String month, UserPrincipal currentUser) {
        if (!currentUser.getRole().equals("OWNER")) {
            throw new ForbiddenException("Only owner can view system reports");
        }

        YearMonth yearMonth = YearMonth.parse(month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        // Get all stores
        List<Store> stores = storeRepository.findAll();
        int totalStores = stores.size();
        int totalStaff = (int) userRepository.countByRole(Role.STAFF);
        int totalManagers = (int) userRepository.countByRole(Role.MANAGER);

        // Calculate totals
        long totalShifts = 0;
        BigDecimal totalHoursWorked = BigDecimal.ZERO;
        BigDecimal totalPayroll = BigDecimal.ZERO;

        List<StoreReportResponse> storeReports = stores.stream()
                .map(store -> {
                    try {
                        return getStoreReportInternal(store, month, startDate, endDate);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(report -> report != null)
                .collect(Collectors.toList());

        long totalTasks = 0;
        long totalCompletedTasks = 0;
        long totalOverdueTasks = 0;
        
        // Attendance and punctuality totals
        long totalAssignedShifts = 0;
        long totalAttendedShifts = 0;
        long totalMissedShifts = 0;
        long totalLateCheckIns = 0;
        long totalEarlyCheckOuts = 0;

        for (StoreReportResponse report : storeReports) {
            totalShifts += report.getTotalShifts();
            totalHoursWorked = totalHoursWorked.add(report.getTotalHoursWorked());
            totalPayroll = totalPayroll.add(report.getTotalPayroll());
            totalTasks += report.getTotalTasks();
            totalCompletedTasks += report.getCompletedTasks();
            totalOverdueTasks += report.getOverdueTasks();
            
            // Sum attendance metrics
            totalAssignedShifts += report.getTotalAssignedShifts();
            totalAttendedShifts += report.getAttendedShifts();
            totalMissedShifts += report.getMissedShifts();
            totalLateCheckIns += report.getLateCheckIns();
            totalEarlyCheckOuts += report.getEarlyCheckOuts();
        }

        // Calculate system-wide rates
        BigDecimal totalAttendanceRate = totalAssignedShifts > 0
                ? BigDecimal.valueOf(totalAttendedShifts)
                        .divide(BigDecimal.valueOf(totalAssignedShifts), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal totalPunctualityRate = totalAttendedShifts > 0
                ? BigDecimal.valueOf(totalAttendedShifts - totalLateCheckIns - totalEarlyCheckOuts)
                        .divide(BigDecimal.valueOf(totalAttendedShifts), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        int totalPendingRequests = (int) requestRepository.countPendingRequests();

        return SystemReportResponse.builder()
                .month(month)
                .totalStores(totalStores)
                .totalStaff(totalStaff)
                .totalManagers(totalManagers)
                .totalShifts(totalShifts)
                .totalHoursWorked(totalHoursWorked)
                .totalPayroll(totalPayroll)
                .totalPendingRequests(totalPendingRequests)
                .totalTasks(totalTasks)
                .totalCompletedTasks(totalCompletedTasks)
                .totalOverdueTasks(totalOverdueTasks)
                .totalAssignedShifts(totalAssignedShifts)
                .totalAttendedShifts(totalAttendedShifts)
                .totalMissedShifts(totalMissedShifts)
                .totalAttendanceRate(totalAttendanceRate)
                .totalLateCheckIns(totalLateCheckIns)
                .totalEarlyCheckOuts(totalEarlyCheckOuts)
                .totalPunctualityRate(totalPunctualityRate)
                .storeReports(storeReports)
                .build();
    }

    private StoreReportResponse getStoreReportInternal(Store store, String month, LocalDateTime startDate, LocalDateTime endDate) {
        Long storeId = store.getId();

        int totalStaff = (int) userRepository.countStaffByStore(storeId);
        
        YearMonth yearMonth = YearMonth.parse(month);
        long totalShifts = shiftRepository.countByStoreAndMonth(storeId, yearMonth.getMonthValue(), yearMonth.getYear());
        
        Long totalMinutes = timeLogRepository.sumDurationByStoreAndDateRange(storeId, startDate, endDate);
        BigDecimal totalHoursWorked = totalMinutes != null ? 
                BigDecimal.valueOf(totalMinutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        BigDecimal totalPayroll = payrollRepository.sumTotalPayByStoreAndMonth(storeId, month);
        if (totalPayroll == null) totalPayroll = BigDecimal.ZERO;

        List<com.coffee.management.entity.Request> storeRequests = requestRepository.findByStoreId(storeId);
        int pendingRequests = (int) storeRequests.stream().filter(r -> r.getStatus() == RequestStatus.PENDING).count();
        int approvedRequests = (int) storeRequests.stream().filter(r -> r.getStatus() == RequestStatus.APPROVED).count();
        int rejectedRequests = (int) storeRequests.stream().filter(r -> r.getStatus() == RequestStatus.REJECTED).count();

        // Task statistics - count tasks created in the month
        long totalTasks = taskRepository.countByStoreAndDateRange(storeId, startDate, endDate);
        long completedTasks = taskRepository.countCompletedByStoreAndDateRange(storeId, startDate, endDate);
        long overdueTasks = taskRepository.countOverdueByStoreAndDateRange(storeId, LocalDateTime.now(), startDate, endDate);
        
        // Count by status - tasks created in the month
        List<com.coffee.management.entity.Task> tasks = taskRepository.findByStoreIdOrderByDueDateAsc(storeId);
        long pendingTasks = tasks.stream()
                .filter(t -> t.getStatus() == com.coffee.management.entity.TaskStatus.PENDING 
                        && !t.getCreatedAt().isBefore(startDate) 
                        && !t.getCreatedAt().isAfter(endDate))
                .count();
        long inProgressTasks = tasks.stream()
                .filter(t -> t.getStatus() == com.coffee.management.entity.TaskStatus.IN_PROGRESS 
                        && !t.getCreatedAt().isBefore(startDate) 
                        && !t.getCreatedAt().isAfter(endDate))
                .count();

        // Calculate attendance and punctuality metrics
        AttendanceMetrics attendanceMetrics = calculateAttendanceMetrics(storeId, startDate, endDate);

        return StoreReportResponse.builder()
                .storeId(storeId)
                .storeName(store.getName())
                .month(month)
                .totalStaff(totalStaff)
                .totalShifts(totalShifts)
                .totalHoursWorked(totalHoursWorked)
                .totalPayroll(totalPayroll)
                .pendingRequests(pendingRequests)
                .approvedRequests(approvedRequests)
                .rejectedRequests(rejectedRequests)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .overdueTasks(overdueTasks)
                .pendingTasks(pendingTasks)
                .inProgressTasks(inProgressTasks)
                .totalAssignedShifts(attendanceMetrics.totalAssignedShifts)
                .attendedShifts(attendanceMetrics.attendedShifts)
                .missedShifts(attendanceMetrics.missedShifts)
                .attendanceRate(attendanceMetrics.attendanceRate)
                .lateCheckIns(attendanceMetrics.lateCheckIns)
                .earlyCheckOuts(attendanceMetrics.earlyCheckOuts)
                .punctualityRate(attendanceMetrics.punctualityRate)
                .build();
    }

    /**
     * Calculate attendance and punctuality metrics for a store
     */
    private AttendanceMetrics calculateAttendanceMetrics(Long storeId, LocalDateTime startDate, LocalDateTime endDate) {
        // Get all shift assignments for the store in the date range
        List<com.coffee.management.entity.ShiftAssignment> assignments = 
                shiftAssignmentRepository.findByStoreIdAndDateRange(storeId, startDate, endDate);
        
        long totalAssignedShifts = assignments.size();
        long attendedShifts = 0;
        long missedShifts = 0;
        long lateCheckIns = 0;
        long earlyCheckOuts = 0;

        // Get all time logs for the store in the date range
        List<com.coffee.management.entity.TimeLog> timeLogs = 
                timeLogRepository.findByStoreAndDateRange(storeId, startDate, endDate);

        // Create a map of shift ID to time log for quick lookup
        Map<Long, com.coffee.management.entity.TimeLog> timeLogByShift = timeLogs.stream()
                .filter(tl -> tl.getShift() != null)
                .collect(Collectors.toMap(
                        tl -> tl.getShift().getId(),
                        tl -> tl,
                        (existing, replacement) -> existing
                ));

        LocalDateTime now = LocalDateTime.now();

        // Process each assignment
        for (com.coffee.management.entity.ShiftAssignment assignment : assignments) {
            com.coffee.management.entity.Shift shift = assignment.getShift();
            com.coffee.management.entity.TimeLog timeLog = timeLogByShift.get(shift.getId());

            if (timeLog != null && timeLog.getCheckIn() != null) {
                // Employee attended this shift
                attendedShifts++;

                // Check for late check-in (> 15 minutes after shift start)
                if (timeLog.getCheckIn().isAfter(shift.getStartDatetime().plusMinutes(15))) {
                    lateCheckIns++;
                }

                // Check for early check-out (> 15 minutes before shift end)
                if (timeLog.getCheckOut() != null && 
                    timeLog.getCheckOut().isBefore(shift.getEndDatetime().minusMinutes(15))) {
                    earlyCheckOuts++;
                }
            } else if (shift.getEndDatetime().isBefore(now)) {
                // Shift has passed without attendance
                missedShifts++;
            }
        }

        // Calculate rates
        BigDecimal attendanceRate = totalAssignedShifts > 0
                ? BigDecimal.valueOf(attendedShifts)
                        .divide(BigDecimal.valueOf(totalAssignedShifts), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal punctualityRate = attendedShifts > 0
                ? BigDecimal.valueOf(attendedShifts - lateCheckIns - earlyCheckOuts)
                        .divide(BigDecimal.valueOf(attendedShifts), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new AttendanceMetrics(
                totalAssignedShifts,
                attendedShifts,
                missedShifts,
                attendanceRate,
                lateCheckIns,
                earlyCheckOuts,
                punctualityRate
        );
    }

    /**
     * Helper class to hold attendance metrics
     */
    private static class AttendanceMetrics {
        final long totalAssignedShifts;
        final long attendedShifts;
        final long missedShifts;
        final BigDecimal attendanceRate;
        final long lateCheckIns;
        final long earlyCheckOuts;
        final BigDecimal punctualityRate;

        AttendanceMetrics(long totalAssignedShifts, long attendedShifts, long missedShifts,
                         BigDecimal attendanceRate, long lateCheckIns, long earlyCheckOuts,
                         BigDecimal punctualityRate) {
            this.totalAssignedShifts = totalAssignedShifts;
            this.attendedShifts = attendedShifts;
            this.missedShifts = missedShifts;
            this.attendanceRate = attendanceRate;
            this.lateCheckIns = lateCheckIns;
            this.earlyCheckOuts = earlyCheckOuts;
            this.punctualityRate = punctualityRate;
        }
    }
}








