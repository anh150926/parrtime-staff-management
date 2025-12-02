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
import java.util.List;
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

        for (StoreReportResponse report : storeReports) {
            totalShifts += report.getTotalShifts();
            totalHoursWorked = totalHoursWorked.add(report.getTotalHoursWorked());
            totalPayroll = totalPayroll.add(report.getTotalPayroll());
        }

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
                .build();
    }
}








