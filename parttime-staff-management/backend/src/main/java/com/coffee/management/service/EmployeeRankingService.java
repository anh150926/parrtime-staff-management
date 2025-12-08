package com.coffee.management.service;

import com.coffee.management.dto.report.EmployeeRankingResponse;
import com.coffee.management.entity.*;
import com.coffee.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for calculating employee rankings and performance metrics
 */
@Service
@Transactional(readOnly = true)
public class EmployeeRankingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShiftAssignmentRepository assignmentRepository;

    @Autowired
    private TimeLogRepository timeLogRepository;

    @Autowired
    private TaskRepository taskRepository;

    /**
     * Get employee rankings for a specific month
     */
    public List<EmployeeRankingResponse> getEmployeeRankings(Integer year, Integer month, Long storeId) {
        // Determine date range
        LocalDateTime startDate;
        LocalDateTime endDate;
        
        if (year != null && month != null) {
            startDate = LocalDateTime.of(year, month, 1, 0, 0);
            endDate = startDate.plusMonths(1).minusSeconds(1);
        } else {
            // Default: current month
            LocalDateTime now = LocalDateTime.now();
            startDate = LocalDateTime.of(now.getYear(), now.getMonth(), 1, 0, 0);
            endDate = startDate.plusMonths(1).minusSeconds(1);
        }

        // Get staff list
        List<User> staffList;
        if (storeId != null) {
            staffList = userRepository.findActiveStaffByStoreId(storeId);
        } else {
            staffList = userRepository.findAllActiveStaff();
        }

        // Calculate metrics for each staff
        List<EmployeeRankingResponse> rankings = new ArrayList<>();
        
        for (User staff : staffList) {
            EmployeeRankingResponse ranking = calculateStaffMetrics(staff, startDate, endDate);
            rankings.add(ranking);
        }

        // Sort by performance score (descending), with tie-breakers:
        // 1. Performance score (highest first)
        // 2. Attendance rate (highest first)
        // 3. If attendance rate is equal and both are 0%: prefer employee with fewer total shifts assigned
        // 4. Punctuality rate (highest first)
        // 5. Total hours worked (highest first)
        // 6. Full name (alphabetical)
        rankings.sort((a, b) -> {
            // First: Compare by performance score
            int scoreCompare = Double.compare(b.getPerformanceScore(), a.getPerformanceScore());
            if (scoreCompare != 0) return scoreCompare;
            
            // Second: Compare by attendance rate
            int attendanceCompare = Double.compare(b.getAttendanceRate(), a.getAttendanceRate());
            if (attendanceCompare != 0) return attendanceCompare;
            
            // Third: If both have same attendance rate (especially 0%),
            // prefer employee with fewer total shifts assigned (less opportunity = better ranking)
            // This handles cases like 0/1 vs 0/5 - the one with 1 shift should rank higher
            // When attendance rates are equal and low (especially 0%), fewer assigned shifts = better
            if (a.getAttendanceRate() < 1.0 && b.getAttendanceRate() < 1.0) {
                int shiftsCompare = Integer.compare(a.getTotalShifts(), b.getTotalShifts());
                if (shiftsCompare != 0) return shiftsCompare;
            }
            
            // Fourth: Compare by punctuality rate
            int punctualityCompare = Double.compare(b.getPunctualityRate(), a.getPunctualityRate());
            if (punctualityCompare != 0) return punctualityCompare;
            
            // Fifth: Compare by total hours worked
            int hoursCompare = Double.compare(b.getTotalHoursWorked(), a.getTotalHoursWorked());
            if (hoursCompare != 0) return hoursCompare;
            
            // Sixth: Compare by full name (alphabetical)
            return a.getFullName().compareToIgnoreCase(b.getFullName());
        });

        // Assign ranks and labels
        for (int i = 0; i < rankings.size(); i++) {
            EmployeeRankingResponse r = rankings.get(i);
            r.setRank(i + 1);
            r.setRankLabel(getRankLabel(i + 1, rankings.size(), r.getPerformanceScore()));
        }

        return rankings;
    }

    /**
     * Get top performers (most hardworking)
     */
    public List<EmployeeRankingResponse> getTopPerformers(int limit, Long storeId) {
        List<EmployeeRankingResponse> rankings = getEmployeeRankings(null, null, storeId);
        return rankings.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get lowest performers (need improvement)
     */
    public List<EmployeeRankingResponse> getLowestPerformers(int limit, Long storeId) {
        List<EmployeeRankingResponse> rankings = getEmployeeRankings(null, null, storeId);
        Collections.reverse(rankings);
        
        // Re-assign ranks from bottom
        List<EmployeeRankingResponse> result = rankings.stream()
                .limit(limit)
                .collect(Collectors.toList());
        
        return result;
    }

    private EmployeeRankingResponse calculateStaffMetrics(User staff, LocalDateTime startDate, LocalDateTime endDate) {
        EmployeeRankingResponse.EmployeeRankingResponseBuilder builder = EmployeeRankingResponse.builder()
                .userId(staff.getId())
                .fullName(staff.getFullName())
                .storeId(staff.getStore() != null ? staff.getStore().getId() : null)
                .storeName(staff.getStore() != null ? staff.getStore().getName() : "N/A");

        // Get shift assignments
        List<ShiftAssignment> assignments = assignmentRepository.findByUserIdAndDateRange(
                staff.getId(), startDate, endDate);
        
        int totalShifts = assignments.size();
        int attendedShifts = 0;
        int missedShifts = 0;
        double totalHoursWorked = 0;

        // Get time logs
        List<TimeLog> timeLogs = timeLogRepository.findByUserIdAndDateRange(
                staff.getId(), startDate, endDate);
        
        Map<Long, TimeLog> timeLogByShift = timeLogs.stream()
                .filter(tl -> tl.getShift() != null)
                .collect(Collectors.toMap(
                        tl -> tl.getShift().getId(),
                        tl -> tl,
                        (existing, replacement) -> existing
                ));

        int lateCheckIns = 0;
        int earlyCheckOuts = 0;

        for (ShiftAssignment assignment : assignments) {
            Shift shift = assignment.getShift();
            TimeLog timeLog = timeLogByShift.get(shift.getId());

            if (timeLog != null && timeLog.getCheckIn() != null) {
                attendedShifts++;
                
                // Calculate hours worked
                if (timeLog.getCheckOut() != null) {
                    long minutes = ChronoUnit.MINUTES.between(timeLog.getCheckIn(), timeLog.getCheckOut());
                    totalHoursWorked += minutes / 60.0;
                }

                // Check punctuality
                if (timeLog.getCheckIn().isAfter(shift.getStartDatetime().plusMinutes(15))) {
                    lateCheckIns++;
                }
                if (timeLog.getCheckOut() != null && 
                    timeLog.getCheckOut().isBefore(shift.getEndDatetime().minusMinutes(15))) {
                    earlyCheckOuts++;
                }
            } else if (shift.getEndDatetime().isBefore(LocalDateTime.now())) {
                // Shift has passed without attendance
                missedShifts++;
            }
        }

        // Task statistics
        List<Task> tasks = taskRepository.findByAssignedToIdAndDateRange(staff.getId(), startDate, endDate);
        int totalTasks = tasks.size();
        int completedTasks = (int) tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                .count();

        // Calculate rates
        double attendanceRate = totalShifts > 0 ? (attendedShifts * 100.0 / totalShifts) : 100;
        double taskCompletionRate = totalTasks > 0 ? (completedTasks * 100.0 / totalTasks) : 100;
        double punctualityRate = attendedShifts > 0 ? 
                ((attendedShifts - lateCheckIns - earlyCheckOuts) * 100.0 / attendedShifts) : 100;

        // Calculate overall performance score (weighted average)
        // Attendance: 40%, Punctuality: 30%, Task completion: 30%
        double performanceScore = (attendanceRate * 0.4) + (punctualityRate * 0.3) + (taskCompletionRate * 0.3);

        return builder
                .totalShifts(totalShifts)
                .totalHoursWorked(Math.round(totalHoursWorked * 10) / 10.0)
                .attendedShifts(attendedShifts)
                .missedShifts(missedShifts)
                .attendanceRate(Math.round(attendanceRate * 10) / 10.0)
                .completedTasks(completedTasks)
                .totalTasks(totalTasks)
                .taskCompletionRate(Math.round(taskCompletionRate * 10) / 10.0)
                .lateCheckIns(lateCheckIns)
                .earlyCheckOuts(earlyCheckOuts)
                .punctualityRate(Math.round(punctualityRate * 10) / 10.0)
                .performanceScore(Math.round(performanceScore * 10) / 10.0)
                .build();
    }

    private String getRankLabel(int rank, int total, double score) {
        if (score >= 90) {
            return "Xuất sắc";
        } else if (score >= 80) {
            return "Tốt";
        } else if (score >= 70) {
            return "Khá";
        } else if (score >= 60) {
            return "Trung bình";
        } else {
            return "Cần cải thiện";
        }
    }
}



