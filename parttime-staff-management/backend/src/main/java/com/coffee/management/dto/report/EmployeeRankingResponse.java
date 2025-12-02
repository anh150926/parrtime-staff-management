package com.coffee.management.dto.report;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeRankingResponse {
    private Long userId;
    private String fullName;
    private String storeName;
    private Long storeId;
    
    // Working statistics
    private int totalShifts;              // Tổng số ca làm
    private double totalHoursWorked;      // Tổng giờ làm
    private int attendedShifts;           // Số ca đã đi làm
    private int missedShifts;             // Số ca vắng mặt
    private double attendanceRate;        // Tỷ lệ đi làm (%)
    
    // Performance metrics
    private int completedTasks;           // Số nhiệm vụ hoàn thành
    private int totalTasks;               // Tổng nhiệm vụ được giao
    private double taskCompletionRate;    // Tỷ lệ hoàn thành nhiệm vụ (%)
    
    // Punctuality
    private int lateCheckIns;             // Số lần check-in muộn
    private int earlyCheckOuts;           // Số lần check-out sớm
    private double punctualityRate;       // Tỷ lệ đúng giờ (%)
    
    // Overall score (0-100)
    private double performanceScore;
    
    // Ranking
    private int rank;
    private String rankLabel;             // Chăm chỉ nhất, Cần cải thiện, etc.
}



