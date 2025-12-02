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
    private List<StoreReportResponse> storeReports;
}








