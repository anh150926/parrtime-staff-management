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
}








