package com.coffee.management.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemReportResponse {
    
    private String month;
    private int totalStores;
    private int totalStaff;
    private int totalManagers;
    private long totalShifts;
    private BigDecimal totalHoursWorked;
    private BigDecimal totalPayroll;
    private int totalPendingRequests;
    
    // Task statistics
    private long totalTasks;
    private long totalCompletedTasks;
    private long totalOverdueTasks;
    
    // Attendance and Punctuality statistics (system-wide totals)
    private long totalAssignedShifts;      // Tổng số ca được phân công
    private long totalAttendedShifts;      // Tổng số ca đã đi làm
    private long totalMissedShifts;        // Tổng số ca vắng mặt
    private BigDecimal totalAttendanceRate; // Tỷ lệ đi làm hệ thống (%)
    private long totalLateCheckIns;        // Tổng số lần check-in muộn
    private long totalEarlyCheckOuts;      // Tổng số lần check-out sớm
    private BigDecimal totalPunctualityRate; // Tỷ lệ đúng giờ hệ thống (%)
    
    private List<StoreReportResponse> storeReports;
}








