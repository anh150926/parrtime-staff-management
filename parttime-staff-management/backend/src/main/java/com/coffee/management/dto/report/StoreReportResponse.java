package com.coffee.management.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreReportResponse {
    
    private Long storeId;
    private String storeName;
    private String month;
    private int totalStaff;
    private long totalShifts;
    private BigDecimal totalHoursWorked;
    private BigDecimal totalPayroll;
    private int pendingRequests;
    private int approvedRequests;
    private int rejectedRequests;
    
    // Task statistics
    private long totalTasks;
    private long completedTasks;
    private long overdueTasks;
    private long pendingTasks;
    private long inProgressTasks;
    
    // Attendance and Punctuality statistics
    private long totalAssignedShifts;      // Tổng số ca được phân công
    private long attendedShifts;           // Số ca đã đi làm
    private long missedShifts;             // Số ca vắng mặt
    private BigDecimal attendanceRate;     // Tỷ lệ đi làm (%)
    private long lateCheckIns;             // Số lần check-in muộn (> 15 phút)
    private long earlyCheckOuts;           // Số lần check-out sớm (> 15 phút)
    private BigDecimal punctualityRate;    // Tỷ lệ đúng giờ (%)
}








